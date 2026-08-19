import { describe, it, expect } from 'vitest';
import {
  validateUploadedFile,
  sanitizeFileName,
  cleanExtractedText,
  calculateTextMetrics,
} from '../src/lib/validators';

describe('Validation Helpers', () => {
  it('validates correct PDF file', () => {
    const file = { name: 'report.pdf', size: 1024 * 500, type: 'application/pdf' };
    const res = validateUploadedFile(file as any);
    expect(res.valid).toBe(true);
  });

  it('validates correct PNG file', () => {
    const file = { name: 'scan.png', size: 1024 * 800, type: 'image/png' };
    const res = validateUploadedFile(file as any);
    expect(res.valid).toBe(true);
  });

  it('rejects oversized files (>10MB)', () => {
    const file = { name: 'huge.pdf', size: 15 * 1024 * 1024, type: 'application/pdf' };
    const res = validateUploadedFile(file as any);
    expect(res.valid).toBe(false);
    expect(res.errorCode).toBe('FILE_TOO_LARGE');
  });

  it('rejects unsupported file types (.exe, .mp4)', () => {
    const file = { name: 'virus.exe', size: 1024, type: 'application/x-msdownload' };
    const res = validateUploadedFile(file as any);
    expect(res.valid).toBe(false);
    expect(res.errorCode).toBe('UNSUPPORTED_TYPE');
  });

  it('sanitizes malicious filenames', () => {
    const dangerous = '../../etc/passwd..$$file!.pdf';
    const clean = sanitizeFileName(dangerous);
    expect(clean).not.toContain('/');
    expect(clean).not.toContain('..');
  });

  it('cleans raw text with control characters and extra spaces', () => {
    const dirty = 'Hello \x00 world!\r\n\r\n\n\nThis is a   test.\n';
    const clean = cleanExtractedText(dirty);
    expect(clean).toBe('Hello world!\n\nThis is a test.');
  });

  it('calculates accurate word and character counts', () => {
    const sample = 'The quick brown fox jumps over the lazy dog.';
    const metrics = calculateTextMetrics(sample);
    expect(metrics.wordCount).toBe(9);
    expect(metrics.characterCount).toBe(sample.length);
    expect(metrics.estimatedReadTimeMinutes).toBe(1);
  });
});
