export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
] as const;

export const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.webp'] as const;

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit
export const MAX_FILE_SIZE_MB = 10;

export interface ValidationResult {
  valid: boolean;
  error?: string;
  errorCode?: string;
}

/**
 * Validates file type, extension, and file size.
 */
export function validateUploadedFile(file: File | { name: string; size: number; type: string }): ValidationResult {
  if (!file) {
    return { valid: false, error: 'No file provided.', errorCode: 'NO_FILE' };
  }

  if (file.size <= 0) {
    return { valid: false, error: 'The uploaded file is empty.', errorCode: 'EMPTY_FILE' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed limit of ${MAX_FILE_SIZE_MB}MB.`,
      errorCode: 'FILE_TOO_LARGE',
    };
  }

  const name = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
  const hasValidMime = ALLOWED_MIME_TYPES.includes(file.type as any) || file.type === '';

  if (!hasValidExtension && !hasValidMime) {
    return {
      valid: false,
      error: 'Unsupported file type. Please upload a PDF or an image (PNG, JPG, JPEG, WEBP).',
      errorCode: 'UNSUPPORTED_TYPE',
    };
  }

  return { valid: true };
}

/**
 * Sanitizes a filename to avoid path traversal and invalid characters.
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName) return 'document';
  return fileName
    .replace(/\.\./g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .slice(0, 100);
}

/**
 * Cleans and normalizes extracted text while preserving logical paragraph breaks.
 */
export function cleanExtractedText(rawText: string): string {
  if (!rawText) return '';

  return rawText
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Calculates words, characters, paragraphs, and estimated reading time.
 */
export function calculateTextMetrics(text: string) {
  const clean = cleanExtractedText(text);
  const words = clean.length > 0 ? clean.split(/\s+/).filter(Boolean).length : 0;
  const characters = clean.length;
  const paragraphs = clean.length > 0 ? clean.split(/\n{2,}/).filter((p) => p.trim().length > 0).length : 0;
  const estimatedReadTimeMinutes = Math.max(1, Math.ceil(words / 200));

  return {
    wordCount: words,
    characterCount: characters,
    paragraphCount: paragraphs,
    estimatedReadTimeMinutes,
  };
}
