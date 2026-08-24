import { GoogleGenerativeAI } from '@google/generative-ai';
import { cleanExtractedText } from '@/lib/validators';
import type { AskDocumentResponse } from '@/types';

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

/**
 * Offline keyword/relevance retrieval engine for fallback question answering.
 */
function answerOfflineFallback(documentText: string, question: string): AskDocumentResponse {
  const clean = cleanExtractedText(documentText);
  const sentences = clean
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);

  const keywords = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !['what', 'when', 'where', 'which', 'who', 'how', 'why', 'is', 'are', 'the', 'this', 'that', 'and', 'for', 'with'].includes(w));

  // Score sentences based on keyword matches
  const scored = sentences.map((sentence) => {
    const sLower = sentence.toLowerCase();
    let score = 0;
    for (const kw of keywords) {
      if (sLower.includes(kw)) score += 1;
    }
    return { sentence, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const relevantMatches = scored.filter((s) => s.score > 0).slice(0, 3);

  if (relevantMatches.length === 0) {
    return {
      success: true,
      answer: `Based on the provided document, I could not find specific details answering "${question}". (Running in offline fallback mode).`,
      sources: [],
      suggestedFollowUps: [
        'What are the main topics discussed in this document?',
        'Can you summarize the primary findings?',
      ],
    };
  }

  const answer = relevantMatches.map((m) => m.sentence).join(' ');
  const sources = relevantMatches.map((m) => m.sentence);

  return {
    success: true,
    answer: `According to the document:\n\n${answer}`,
    sources,
    suggestedFollowUps: [
      'What are the related action items?',
      'Can you explain this in simpler terms?',
    ],
  };
}

/**
 * Builds the grounded Q&A prompt.
 */
function buildQAPrompt(documentText: string, question: string, history?: { role: string; content: string }[]): string {
  let conversationContext = '';
  if (history && history.length > 0) {
    conversationContext = `\nPREVIOUS CONVERSATION CONTEXT:\n${history
      .slice(-4)
      .map((h) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`)
      .join('\n')}\n`;
  }

  return `You are a document question-answering assistant. You must answer the user's question STRICTLY and EXCLUSIVELY based on the provided document text.

CRITICAL RULES:
1. Ground every statement in the source document. Do NOT extrapolate, speculate, or bring in outside world knowledge not found in the text.
2. If the answer cannot be found in the document, reply: "Based on the provided document, this information is not mentioned or available."
3. Extract 1-3 exact, verbatim excerpt sentences as "sources" (citations) from the document that prove your answer.
4. Suggest 2 relevant follow-up questions the user might want to explore next.

Return ONLY a valid JSON object matching this exact schema:
{
  "answer": "Clear, direct, and well-structured answer to the user's question...",
  "sources": [
    "Exact verbatim quote 1 from document",
    "Exact verbatim quote 2 from document"
  ],
  "suggestedFollowUps": [
    "Relevant follow-up question 1?",
    "Relevant follow-up question 2?"
  ]
}
${conversationContext}
DOCUMENT TEXT:
---
${documentText}
---

USER QUESTION:
${question}`;
}

/**
 * Answers a question about the document using Gemini AI with citation grounding.
 */
export async function askDocumentQuestion(
  documentText: string,
  question: string,
  history?: { role: 'user' | 'assistant'; content: string }[]
): Promise<AskDocumentResponse> {
  const clean = cleanExtractedText(documentText);

  if (!clean || clean.length < 10) {
    return {
      success: false,
      error: 'Document text is empty or too short to answer questions.',
    };
  }

  if (!question || question.trim().length === 0) {
    return {
      success: false,
      error: 'Please enter a question to ask.',
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return answerOfflineFallback(clean, question);
  }

  try {
    // If document is very long, pass a truncated relevant section or full text if within limits
    const maxDocLength = 40000;
    const textToPass = clean.length > maxDocLength ? clean.slice(0, maxDocLength) + '\n\n[...remaining text truncated for context limit...]' : clean;

    const prompt = buildQAPrompt(textToPass, question, history);
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: DEFAULT_MODEL,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1, // very low temperature for maximum grounding and zero hallucination
      },
    });

    const res = await model.generateContent(prompt);
    const responseText = res.response.text()?.trim() || '{}';

    const cleanedJson = responseText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsed = JSON.parse(cleanedJson);

    return {
      success: true,
      answer: parsed.answer || 'Could not synthesize an answer from the document.',
      sources: Array.isArray(parsed.sources) ? parsed.sources : [],
      suggestedFollowUps: Array.isArray(parsed.suggestedFollowUps) ? parsed.suggestedFollowUps : [],
    };
  } catch (error: any) {
    console.error('Q&A API error, falling back to offline retrieval:', error);
    return answerOfflineFallback(clean, question);
  }
}
