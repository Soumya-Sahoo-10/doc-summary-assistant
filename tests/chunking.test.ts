import { describe, it, expect } from 'vitest';
import { chunkText } from '../src/services/aiSummarizer';

describe('Document Text Chunker', () => {
  it('returns single chunk for short text', () => {
    const text = 'Short document text with a single sentence.';
    const chunks = chunkText(text, 1000);
    expect(chunks.length).toBe(1);
    expect(chunks[0]).toBe(text);
  });

  it('splits long documents into multiple overlapping chunks', () => {
    const paragraph = 'This is a sample paragraph with detailed text about document summarization. ';
    const longText = paragraph.repeat(100); // approx 7600 chars
    const chunks = chunkText(longText, 2000, 200);

    expect(chunks.length).toBeGreaterThan(1);
    chunks.forEach((chunk) => {
      expect(chunk.length).toBeGreaterThan(0);
    });
  });
});
