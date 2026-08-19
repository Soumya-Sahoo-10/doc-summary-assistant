import { GoogleGenerativeAI } from '@google/generative-ai';
import { calculateTextMetrics, cleanExtractedText } from '@/lib/validators';
import type { SummaryLength, SummaryResult } from '@/types';

const CHUNK_SIZE_CHARS = 12000;
const CHUNK_OVERLAP_CHARS = 1000;
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

/**
 * Splits large text into overlapping chunks if it exceeds CHUNK_SIZE_CHARS.
 */
export function chunkText(text: string, chunkSize = CHUNK_SIZE_CHARS, overlap = CHUNK_OVERLAP_CHARS): string[] {
  if (!text || text.length <= chunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    let endIndex = startIndex + chunkSize;

    if (endIndex < text.length) {
      const nextDoubleNewline = text.lastIndexOf('\n\n', endIndex);
      const nextPeriod = text.lastIndexOf('. ', endIndex);

      if (nextDoubleNewline > startIndex + chunkSize / 2) {
        endIndex = nextDoubleNewline + 2;
      } else if (nextPeriod > startIndex + chunkSize / 2) {
        endIndex = nextPeriod + 2;
      }
    } else {
      endIndex = text.length;
    }

    const chunk = text.slice(startIndex, endIndex).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    if (endIndex >= text.length) break;
    startIndex = Math.max(startIndex + 1, endIndex - overlap);
  }

  return chunks;
}

/**
 * Generates an intelligent extractive fallback summary when no AI key is configured.
 */
function generateExtractiveFallback(text: string, length: SummaryLength): SummaryResult {
  const clean = cleanExtractedText(text);
  const sentences = clean
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  const targetSentenceCount = length === 'short' ? 3 : length === 'medium' ? 6 : 10;
  const selectedSentences = sentences.slice(0, targetSentenceCount);
  const fallbackSummary =
    selectedSentences.join(' ') ||
    'This document contains extracted text ready for analysis. (Note: Running in offline fallback mode without GEMINI_API_KEY).';

  const keyPoints = sentences
    .slice(0, 5)
    .map((s) => (s.length > 120 ? s.slice(0, 117) + '...' : s));

  const mainIdeas = sentences.slice(0, 3);
  const improvementSuggestions = [
    'Add a valid GEMINI_API_KEY to enable full generative AI synthesis and deep nuance detection.',
    'Ensure high-contrast, high-resolution source documents for maximum OCR precision.',
  ];

  const metrics = calculateTextMetrics(fallbackSummary);

  return {
    summary: fallbackSummary,
    keyPoints: keyPoints.length > 0 ? keyPoints : ['Document processed successfully.'],
    mainIdeas: mainIdeas.length > 0 ? mainIdeas : ['Primary content extracted from document.'],
    improvementSuggestions,
    estimatedReadTimeMinutes: metrics.estimatedReadTimeMinutes,
    requestedLength: length,
    modelUsed: 'offline-extractive-fallback',
  };
}

/**
 * Constructs prompt instructions tailored to the chosen summary length.
 */
function buildPrompt(text: string, length: SummaryLength): string {
  const lengthDirectives = {
    short: 'Provide a concise, high-level summary in 1-2 focused paragraphs (approx 100-150 words). Focus only on the core purpose, primary findings, and conclusion.',
    medium: 'Provide a well-structured summary in 2-4 comprehensive paragraphs (approx 250-400 words). Cover the context, key arguments/findings, supporting evidence, and takeaways.',
    long: 'Provide an in-depth, thorough executive summary in 4-6 detailed paragraphs with logical flow (approx 500-800 words). Include all critical nuances, methodologies, results, and implications.',
  };

  return `You are an expert document summarization assistant. Analyze the provided text and produce an intelligent, factual, and strictly faithful summary.

RULES:
1. Stay strictly faithful to the source document. Do NOT hallucinate or assume facts not present.
2. Prioritize essential information, key statistics, dates, decisions, and actionable insights.
3. Remove redundant filler and repetitive phrasing.
4. Summary length directive: ${lengthDirectives[length]}
5. Extract 4-7 crisp, high-impact Key Points.
6. Extract 2-4 overarching Main Ideas.
7. Extract 2-3 Improvement Suggestions or Actionable Takeaways based on the document's content.

Return ONLY a valid JSON object matching this exact schema:
{
  "summary": "Full summary text here...",
  "keyPoints": [
    "Key point 1",
    "Key point 2"
  ],
  "mainIdeas": [
    "Main idea 1",
    "Main idea 2"
  ],
  "improvementSuggestions": [
    "Suggestion/takeaway 1",
    "Suggestion/takeaway 2"
  ]
}

DOCUMENT TEXT:
---
${text}
---`;
}

/**
 * Calls Gemini API to summarize text.
 */
async function callGemini(prompt: string, apiKey: string): Promise<any> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: DEFAULT_MODEL,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
  });

  const result = await model.generateContent(prompt);
  const responseText = result.response.text()?.trim() || '{}';
  
  const cleanedJson = responseText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  return JSON.parse(cleanedJson);
}

/**
 * Summarizes document text with length options and chunking for large documents.
 */
export async function summarizeDocumentText(
  text: string,
  length: SummaryLength = 'medium'
): Promise<SummaryResult> {
  const clean = cleanExtractedText(text);

  if (!clean || clean.length < 20) {
    throw new Error('Extracted text is too short to generate a meaningful summary.');
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('GEMINI_API_KEY not configured. Falling back to rule-based extractive summary.');
    return generateExtractiveFallback(clean, length);
  }

  try {
    const chunks = chunkText(clean);

    let textToSummarize = clean;

    if (chunks.length > 1) {
      console.log(`Document split into ${chunks.length} chunks for processing.`);
      const chunkSummaries: string[] = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunkPrompt = `Summarize Section ${i + 1} of ${chunks.length} concisely, capturing all facts, numbers, and key ideas:\n\n${chunks[i]}`;
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: DEFAULT_MODEL,
          generationConfig: { temperature: 0.2 },
        });
        const res = await model.generateContent(chunkPrompt);
        const chunkTextRes = res.response.text();
        if (chunkTextRes) {
          chunkSummaries.push(chunkTextRes.trim());
        }
      }

      textToSummarize = chunkSummaries.join('\n\n');
    }

    const finalPrompt = buildPrompt(textToSummarize, length);
    const parsed = await callGemini(finalPrompt, apiKey);

    const summary = parsed.summary || 'Summary could not be formatted properly.';
    const keyPoints = Array.isArray(parsed.keyPoints) && parsed.keyPoints.length > 0
      ? parsed.keyPoints
      : ['No key points extracted.'];
    const mainIdeas = Array.isArray(parsed.mainIdeas) && parsed.mainIdeas.length > 0
      ? parsed.mainIdeas
      : [];
    const improvementSuggestions = Array.isArray(parsed.improvementSuggestions)
      ? parsed.improvementSuggestions
      : [];

    const metrics = calculateTextMetrics(summary);

    return {
      summary,
      keyPoints,
      mainIdeas,
      improvementSuggestions,
      estimatedReadTimeMinutes: metrics.estimatedReadTimeMinutes,
      requestedLength: length,
      modelUsed: DEFAULT_MODEL,
    };
  } catch (error: any) {
    console.error('AI summarization failed, reverting to fallback summary:', error);
    const fallback = generateExtractiveFallback(clean, length);
    fallback.modelUsed = `fallback (AI error: ${error.message || 'Unknown'})`;
    return fallback;
  }
}
