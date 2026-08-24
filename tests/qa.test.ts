import { describe, it, expect } from 'vitest';
import { askDocumentQuestion } from '../src/services/aiDocumentQA';

describe('Document Q&A Service', () => {
  const documentText = `
    The Cloud Architecture Service Level Agreement states that system uptime is guaranteed at 99.99% monthly.
    The primary submission deadline for the technical review is September 1st, 2026.
    The total budget allocated for Q4 engineering services is $480,000 USD.
    Disaster recovery failover has a Recovery Time Objective (RTO) of 15 minutes.
  `;

  it('answers questions using grounded fallback retrieval when offline', async () => {
    const res = await askDocumentQuestion(documentText, 'What is the submission deadline?');
    expect(res.success).toBe(true);
    expect(res.answer).toContain('September 1st, 2026');
    expect(res.sources?.length).toBeGreaterThan(0);
  });

  it('retrieves budget and number information accurately', async () => {
    const res = await askDocumentQuestion(documentText, 'What is the total budget?');
    expect(res.success).toBe(true);
    expect(res.answer).toContain('$480,000');
  });

  it('handles empty questions gracefully', async () => {
    const res = await askDocumentQuestion(documentText, '');
    expect(res.success).toBe(false);
    expect(res.error).toBeTruthy();
  });
});
