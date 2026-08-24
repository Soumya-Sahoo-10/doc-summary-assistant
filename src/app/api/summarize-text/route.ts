import { NextRequest, NextResponse } from 'next/server';
import { summarizeDocumentText } from '@/services/aiSummarizer';
import type { SummarizeTextRequest, SummaryLength, SummaryTone } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SummarizeTextRequest;
    const { text, length = 'medium', tone = 'executive' } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Document text is required for summarization.' },
        { status: 400 }
      );
    }

    const validLengths: SummaryLength[] = ['short', 'medium', 'long'];
    const summaryLength: SummaryLength = validLengths.includes(length) ? length : 'medium';

    const validTones: SummaryTone[] = ['executive', 'simple', 'technical', 'student'];
    const summaryTone: SummaryTone = validTones.includes(tone) ? tone : 'executive';

    const summaryResult = await summarizeDocumentText(text, summaryLength, summaryTone);

    return NextResponse.json({
      success: true,
      summaryResult,
    });
  } catch (error: any) {
    console.error('Error in /api/summarize-text:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate summary.',
      },
      { status: 500 }
    );
  }
}
