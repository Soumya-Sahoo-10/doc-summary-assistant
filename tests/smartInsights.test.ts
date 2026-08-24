import { describe, it, expect } from 'vitest';
import { extractHeuristicSmartInsights } from '../src/services/aiSummarizer';

describe('Smart Insights Extraction Service', () => {
  const sampleText = `
    Subject: Project Kickoff and Quarterly Plan.
    The development team must submit the final project documentation by September 15, 2026.
    We need to review section 4 of the cloud infrastructure security audit.
    Total allocated budget for the initiative is $125,000 USD with a target efficiency gain of 35%.
    The organization uses Next.js, React, and Google Gemini API for automated processing.
  `;

  it('extracts action items with categories', () => {
    const insights = extractHeuristicSmartInsights(sampleText);
    expect(insights.actionItems.length).toBeGreaterThan(0);
    const hasSubmitOrReview = insights.actionItems.some((a) =>
      /submit|review/i.test(a.text)
    );
    expect(hasSubmitOrReview).toBe(true);
  });

  it('extracts important dates accurately', () => {
    const insights = extractHeuristicSmartInsights(sampleText);
    expect(insights.importantDates.length).toBeGreaterThan(0);
    const hasDate = insights.importantDates.some((d) =>
      d.date.includes('September')
    );
    expect(hasDate).toBe(true);
  });

  it('extracts metrics and numbers', () => {
    const insights = extractHeuristicSmartInsights(sampleText);
    expect(insights.importantNumbers.length).toBeGreaterThan(0);
    const hasNumber = insights.importantNumbers.some((n) =>
      n.value.includes('125,000') || n.value.includes('35%')
    );
    expect(hasNumber).toBe(true);
  });
});
