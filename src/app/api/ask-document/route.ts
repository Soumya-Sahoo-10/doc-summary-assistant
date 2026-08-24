import { NextRequest, NextResponse } from 'next/server';
import { askDocumentQuestion } from '@/services/aiDocumentQA';
import type { AskDocumentRequest } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AskDocumentRequest;
    const { documentText, question, history } = body;

    if (!documentText || typeof documentText !== 'string' || documentText.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Document text is required for answering questions.' },
        { status: 400 }
      );
    }

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Question is required.' },
        { status: 400 }
      );
    }

    const result = await askDocumentQuestion(documentText, question, history);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in /api/ask-document:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An error occurred while answering your question.',
      },
      { status: 500 }
    );
  }
}
