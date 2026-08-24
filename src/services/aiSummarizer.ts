import { GoogleGenerativeAI } from '@google/generative-ai';
import { calculateTextMetrics, cleanExtractedText } from '@/lib/validators';
import type { SmartInsights, SummaryLength, SummaryTone, SummaryResult, ActionItem, ImportantDate, ImportantNumber, KeyEntity } from '@/types';

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
 * Rule-based heuristic extraction for smart insights (used as fallback or offline mode).
 */
export function extractHeuristicSmartInsights(text: string): SmartInsights {
  const sentences = text.split(/(?<=[.?!])\s+/).map((s) => s.trim()).filter((s) => s.length > 10);
  
  // 1. Action items (sentences with action verbs or bullet points with verbs)
  const actionVerbs = /\b(submit|review|send|complete|contact|ensure|implement|deploy|verify|install|configure|prepare|update|provide|check|create|build)\b/i;
  const actionItems: ActionItem[] = [];
  
  for (const s of sentences) {
    if (actionVerbs.test(s) && actionItems.length < 5) {
      const cleanText = s.replace(/^[•\-*\d.]+\s*/, '').trim();
      let category: ActionItem['category'] = 'General';
      if (/urgent|asap|immediately|deadline|priority/i.test(s)) category = 'Urgent';
      else if (/review|check|audit|evaluate/i.test(s)) category = 'Review';
      else if (/contact|send|email|submit/i.test(s)) category = 'Follow-up';

      actionItems.push({
        id: `act-${actionItems.length + 1}`,
        text: cleanText.length > 120 ? cleanText.slice(0, 117) + '...' : cleanText,
        category,
        completed: false,
      });
    }
  }

  // 2. Dates & Deadlines
  const dateRegex = /\b((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\b\d{4}\b)\b/gi;
  const importantDates: ImportantDate[] = [];
  const seenDates = new Set<string>();

  for (const s of sentences) {
    const match = s.match(dateRegex);
    if (match && importantDates.length < 4) {
      for (const d of match) {
        if (!seenDates.has(d.toLowerCase()) && !/^(19|20)\d{2}$/.test(d.trim())) {
          seenDates.add(d.toLowerCase());
          importantDates.push({
            date: d,
            description: s.length > 100 ? s.slice(0, 97) + '...' : s,
          });
          break;
        }
      }
    }
  }

  // 3. Numbers & Metrics
  const numberRegex = /(\$|€|£|₹)?\b\d+(?:,\d{3})*(?:\.\d+)?\s*(%|USD|EUR|INR|MB|GB|KB|days|hours|minutes|seconds|words|pages|users|times)?\b/gi;
  const importantNumbers: ImportantNumber[] = [];
  const seenMetrics = new Set<string>();

  for (const s of sentences) {
    const matches = s.match(numberRegex);
    if (matches && importantNumbers.length < 4) {
      for (const val of matches) {
        if (val.length > 1 && !seenMetrics.has(val) && !/^\d{4}$/.test(val)) {
          seenMetrics.add(val);
          importantNumbers.push({
            metric: 'Extracted Value',
            value: val.trim(),
            context: s.length > 90 ? s.slice(0, 87) + '...' : s,
          });
          break;
        }
      }
    }
  }

  // 4. Entities
  const keyEntities: KeyEntity[] = [];
  if (/PDF|OCR|AI|Gemini|API|TypeScript|Next\.js|React|Node\.js/i.test(text)) {
    keyEntities.push({ name: 'Document Intelligence', type: 'Technology' });
  }
  if (/Vercel|Netlify|Google|GitHub|Acme|ApexCloud/i.test(text)) {
    keyEntities.push({ name: 'Platform / Vendor', type: 'Organization' });
  }

  return {
    actionItems: actionItems.length > 0 ? actionItems : [
      { id: 'act-1', text: 'Review extracted document key findings and verify summary fidelity.', category: 'Review', completed: false },
      { id: 'act-2', text: 'Distribute executive brief to team stakeholders.', category: 'General', completed: false },
    ],
    importantDates: importantDates.length > 0 ? importantDates : [
      { date: 'Current Session', description: 'Document uploaded and analyzed.' },
    ],
    importantNumbers: importantNumbers.length > 0 ? importantNumbers : [
      { metric: 'Word Count', value: `${text.split(/\s+/).filter(Boolean).length}`, context: 'Total machine-readable words processed from document.' },
    ],
    keyEntities: keyEntities.length > 0 ? keyEntities : [
      { name: 'Document Analysis', type: 'Concept' },
    ],
  };
}

/**
 * Generates an intelligent extractive fallback summary when no AI key is configured.
 */
function generateExtractiveFallback(text: string, length: SummaryLength, tone: SummaryTone = 'executive'): SummaryResult {
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
    'Add a valid GEMINI_API_KEY in .env.local to enable full generative AI synthesis and deep nuance detection.',
    'Ensure high-contrast, high-resolution source documents for maximum OCR precision.',
  ];

  const smartInsights = extractHeuristicSmartInsights(clean);
  const suggestedQuestions = [
    'What is the core purpose and objective of this document?',
    'What are the primary action items and deadlines mentioned?',
    'What are the most critical metrics or numbers reported?',
    'Can you explain the main conclusions in simple terms?',
  ];

  const metrics = calculateTextMetrics(fallbackSummary);

  return {
    summary: fallbackSummary,
    keyPoints: keyPoints.length > 0 ? keyPoints : ['Document processed successfully.'],
    mainIdeas: mainIdeas.length > 0 ? mainIdeas : ['Primary content extracted from document.'],
    improvementSuggestions,
    smartInsights,
    suggestedQuestions,
    estimatedReadTimeMinutes: metrics.estimatedReadTimeMinutes,
    requestedLength: length,
    requestedTone: tone,
    modelUsed: 'offline-extractive-fallback',
  };
}

/**
 * Constructs prompt instructions tailored to the chosen summary length and tone.
 */
function buildPrompt(text: string, length: SummaryLength, tone: SummaryTone = 'executive'): string {
  const lengthDirectives = {
    short: 'Provide a concise, high-level summary in 1-2 focused paragraphs (approx 100-150 words). Focus only on the core purpose, primary findings, and conclusion.',
    medium: 'Provide a well-structured summary in 2-4 comprehensive paragraphs (approx 250-400 words). Cover the context, key arguments/findings, supporting evidence, and takeaways.',
    long: 'Provide an in-depth, thorough executive summary in 4-6 detailed paragraphs with logical flow (approx 500-800 words). Include all critical nuances, methodologies, results, and implications.',
  };

  const toneDirectives = {
    executive: 'Adopt an executive briefing persona: clear, strategic, outcome-oriented, and highlighting business impacts and decisions.',
    simple: 'Adopt an ELI5 (Explain Like I am 5) plain-English persona: remove complex jargon and explain core concepts in clear, accessible language.',
    technical: 'Adopt a senior engineering/technical persona: focus on architecture, specific methodologies, technical parameters, and constraints.',
    student: 'Adopt an educational study-guide persona: organize findings with clear conceptual definitions and learning takeaways.',
  };

  return `You are an expert document intelligence assistant. Analyze the provided text and produce an intelligent, factual, and strictly faithful analysis.

PERSONA & TONE DIRECTIVE:
${toneDirectives[tone]}

RULES:
1. Stay strictly faithful to the source document. Do NOT hallucinate or assume facts not present.
2. Prioritize essential information, key statistics, dates, decisions, and actionable insights.
3. Remove redundant filler and repetitive phrasing.
4. Summary length directive: ${lengthDirectives[length]}
5. Extract 4-7 crisp, high-impact Key Points.
6. Extract 2-4 overarching Main Ideas.
7. Extract 2-3 Improvement Suggestions or Actionable Takeaways based on the document's content.
8. Extract SMART INSIGHTS:
   - actionItems: specific tasks, deliverables, or next steps found in text.
   - importantDates: explicit dates, milestones, or deadlines mentioned.
   - importantNumbers: key financial figures, percentages, quantities, or technical metrics.
   - keyEntities: notable companies, people, technologies, or organizations.
9. Generate 4 dynamic, document-grounded suggested questions that a reader might want to ask next.

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
  ],
  "smartInsights": {
    "actionItems": [
      { "id": "act-1", "text": "Task description", "category": "Urgent" }
    ],
    "importantDates": [
      { "date": "Date string", "description": "What happens on this date" }
    ],
    "importantNumbers": [
      { "metric": "Budget/Metric Name", "value": "$50,000", "context": "Brief context" }
    ],
    "keyEntities": [
      { "name": "Entity Name", "type": "Organization" }
    ]
  },
  "suggestedQuestions": [
    "Question 1 grounded in document?",
    "Question 2 grounded in document?",
    "Question 3 grounded in document?",
    "Question 4 grounded in document?"
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
 * Summarizes document text with length options, tone modes, chunking, and smart insights.
 */
export async function summarizeDocumentText(
  text: string,
  length: SummaryLength = 'medium',
  tone: SummaryTone = 'executive'
): Promise<SummaryResult> {
  const clean = cleanExtractedText(text);

  if (!clean || clean.length < 20) {
    throw new Error('Extracted text is too short to generate a meaningful summary.');
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('GEMINI_API_KEY not configured. Falling back to rule-based extractive summary.');
    return generateExtractiveFallback(clean, length, tone);
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

    const finalPrompt = buildPrompt(textToSummarize, length, tone);
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

    const heuristicInsights = extractHeuristicSmartInsights(clean);
    const smartInsights: SmartInsights = {
      actionItems: Array.isArray(parsed.smartInsights?.actionItems) && parsed.smartInsights.actionItems.length > 0
        ? parsed.smartInsights.actionItems.map((item: any, idx: number) => ({
            id: item.id || `act-${idx + 1}`,
            text: item.text || String(item),
            category: item.category || 'General',
            completed: false,
          }))
        : heuristicInsights.actionItems,
      importantDates: Array.isArray(parsed.smartInsights?.importantDates) && parsed.smartInsights.importantDates.length > 0
        ? parsed.smartInsights.importantDates
        : heuristicInsights.importantDates,
      importantNumbers: Array.isArray(parsed.smartInsights?.importantNumbers) && parsed.smartInsights.importantNumbers.length > 0
        ? parsed.smartInsights.importantNumbers
        : heuristicInsights.importantNumbers,
      keyEntities: Array.isArray(parsed.smartInsights?.keyEntities) && parsed.smartInsights.keyEntities.length > 0
        ? parsed.smartInsights.keyEntities
        : heuristicInsights.keyEntities,
    };

    const suggestedQuestions = Array.isArray(parsed.suggestedQuestions) && parsed.suggestedQuestions.length > 0
      ? parsed.suggestedQuestions
      : [
          'What are the key takeaways from this document?',
          'What are the required action items and next steps?',
          'What are the critical dates and deadlines?',
          'Can you explain the main conclusion in simple terms?',
        ];

    const metrics = calculateTextMetrics(summary);

    return {
      summary,
      keyPoints,
      mainIdeas,
      improvementSuggestions,
      smartInsights,
      suggestedQuestions,
      estimatedReadTimeMinutes: metrics.estimatedReadTimeMinutes,
      requestedLength: length,
      requestedTone: tone,
      modelUsed: DEFAULT_MODEL,
    };
  } catch (error: any) {
    console.error('AI summarization failed, reverting to fallback summary:', error);
    const fallback = generateExtractiveFallback(clean, length, tone);
    fallback.modelUsed = `fallback (AI error: ${error.message || 'Unknown'})`;
    return fallback;
  }
}
