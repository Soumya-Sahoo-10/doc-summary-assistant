import { describe, it, expect } from 'vitest';
import { summarizeDocumentText } from '../src/services/aiSummarizer';

describe('AI Summarizer Service', () => {
  const sampleDocument = `
    Artificial intelligence is transforming how businesses process complex documents.
    Automated document summarization allows knowledge workers to digest multi-page reports in seconds.
    By combining optical character recognition for scanned records and large language models for comprehension,
    modern organizations streamline document workflows significantly.
    Furthermore, accuracy and faithful representation of source facts remain the top priorities.
    Teams must implement validation checks to prevent hallucinations and maintain data integrity.
  `;

  it('generates a valid fallback summary when no API key is present', async () => {
    const result = await summarizeDocumentText(sampleDocument, 'short');
    expect(result).toBeDefined();
    expect(result.summary).toBeTruthy();
    expect(result.keyPoints.length).toBeGreaterThan(0);
    expect(result.requestedLength).toBe('short');
  });

  it('supports medium and long summary requests', async () => {
    const mediumResult = await summarizeDocumentText(sampleDocument, 'medium');
    expect(mediumResult.requestedLength).toBe('medium');

    const longResult = await summarizeDocumentText(sampleDocument, 'long');
    expect(longResult.requestedLength).toBe('long');
  });
});
