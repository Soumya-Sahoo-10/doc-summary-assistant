import { cleanExtractedText, calculateTextMetrics } from '@/lib/validators';
import type { DocumentMetadata, ExtractionMethod } from '@/types';
import { createWorker } from 'tesseract.js';

export interface DocumentProcessingResult {
  text: string;
  metadata: DocumentMetadata;
}

/**
 * Extracts text from a PDF buffer using pdf-parse.
 */
export async function extractTextFromPDF(
  buffer: Uint8Array | ArrayBuffer | Buffer,
  fileName: string,
  fileSize: number
): Promise<DocumentProcessingResult> {
  try {
    const nodeBuffer = Buffer.isBuffer(buffer)
      ? buffer
      : buffer instanceof Uint8Array
      ? Buffer.from(buffer)
      : Buffer.from(new Uint8Array(buffer));

    // Robust dynamic import for pdf-parse in Next.js Server Components / API
    const pdfModule = await import('pdf-parse');
    const pdfParse = (pdfModule as any).default || pdfModule;
    const data = await pdfParse(nodeBuffer);

    const rawText = data.text || '';
    const totalPages = data.numpages || 1;
    const cleanedText = cleanExtractedText(rawText);

    let extractionMethod: ExtractionMethod = 'pdf-native';
    let finalText = cleanedText;

    if (finalText.length < 30 && totalPages > 0) {
      if (finalText.length === 0) {
        throw new Error(
          'No selectable text found in this PDF. It appears to be a scanned document without an embedded text layer. Please convert the page to an image (PNG/JPG) for OCR extraction.'
        );
      }
    }

    const metrics = calculateTextMetrics(finalText);

    const metadata: DocumentMetadata = {
      fileName,
      fileSize,
      fileType: 'application/pdf',
      pageCount: totalPages,
      wordCount: metrics.wordCount,
      characterCount: metrics.characterCount,
      extractionMethod,
      processedAt: new Date().toISOString(),
    };

    return {
      text: finalText,
      metadata,
    };
  } catch (error: any) {
    if (error.message?.includes('scanned document')) {
      throw error;
    }
    throw new Error(`Failed to parse PDF document: ${error.message || 'Unknown parsing error'}`);
  }
}

/**
 * Extracts text from an image buffer using Tesseract OCR.
 */
export async function extractTextFromImage(
  buffer: Buffer | Uint8Array | ArrayBuffer,
  fileName: string,
  fileSize: number,
  mimeType: string = 'image/png'
): Promise<DocumentProcessingResult> {
  let worker: any = null;
  try {
    const uint8 = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    
    worker = await createWorker('eng');
    const ret = await worker.recognize(Buffer.from(uint8));
    const rawText = ret.data.text;
    const cleanedText = cleanExtractedText(rawText);

    if (!cleanedText || cleanedText.length < 5) {
      throw new Error(
        'OCR could not detect any readable text in the image. Please ensure the image is clear and well-lit.'
      );
    }

    const metrics = calculateTextMetrics(cleanedText);

    const metadata: DocumentMetadata = {
      fileName,
      fileSize,
      fileType: mimeType,
      wordCount: metrics.wordCount,
      characterCount: metrics.characterCount,
      extractionMethod: 'ocr-image',
      processedAt: new Date().toISOString(),
    };

    return {
      text: cleanedText,
      metadata,
    };
  } catch (error: any) {
    throw new Error(`OCR processing failed: ${error.message || 'Unknown OCR error'}`);
  } finally {
    if (worker) {
      try {
        await worker.terminate();
      } catch {
        // ignore termination errors
      }
    }
  }
}

/**
 * Orchestrates text extraction based on file type.
 */
export async function processDocumentFile(
  buffer: ArrayBuffer | Uint8Array,
  fileName: string,
  fileSize: number,
  mimeType: string
): Promise<DocumentProcessingResult> {
  const isPdf = mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');

  if (isPdf) {
    return extractTextFromPDF(buffer, fileName, fileSize);
  }

  return extractTextFromImage(buffer, fileName, fileSize, mimeType);
}
