import { NextRequest, NextResponse } from 'next/server';
import { validateUploadedFile, sanitizeFileName } from '@/lib/validators';
import { processDocumentFile } from '@/services/documentProcessor';
import { summarizeDocumentText } from '@/services/aiSummarizer';
import type { ProcessDocumentResponse, SummaryLength } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest): Promise<NextResponse<ProcessDocumentResponse>> {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const requestedLength = (formData.get('length') as SummaryLength) || 'medium';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided in request.', errorCode: 'NO_FILE' },
        { status: 400 }
      );
    }

    // 1. File Validation
    const validation = validateUploadedFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error, errorCode: validation.errorCode },
        { status: 400 }
      );
    }

    const safeName = sanitizeFileName(file.name);
    const arrayBuffer = await file.arrayBuffer();

    // 2. Text Extraction (PDF Parser or OCR)
    const { text: extractedText, metadata } = await processDocumentFile(
      arrayBuffer,
      safeName,
      file.size,
      file.type
    );

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No readable text could be extracted from this document.',
          errorCode: 'EMPTY_TEXT',
        },
        { status: 422 }
      );
    }

    // 3. AI Summarization
    const summaryResult = await summarizeDocumentText(extractedText, requestedLength);

    return NextResponse.json({
      success: true,
      metadata,
      extractedText,
      summaryResult,
    });
  } catch (error: any) {
    console.error('Error in /api/process-document:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An unexpected error occurred while processing the document.',
        errorCode: 'PROCESSING_ERROR',
      },
      { status: 500 }
    );
  }
}
