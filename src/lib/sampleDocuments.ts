import type { DocumentMetadata, SummaryResult } from '@/types';

export interface SampleDocument {
  id: string;
  title: string;
  description: string;
  category: 'PDF Document' | 'Scanned Image (OCR)' | 'Technical Spec';
  badgeColor: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  extractionMethod: 'pdf-native' | 'ocr-image';
  text: string;
}

export const SAMPLE_DOCUMENTS: SampleDocument[] = [
  {
    id: 'sample-assessment-spec',
    title: 'Software Engineer Assessment Spec',
    description: 'The official technical assessment brief outlining requirements, evaluation criteria, and timeline.',
    category: 'Technical Spec',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    fileName: 'Software_Engineering_Technical_Assessment.pdf',
    fileSize: 1024 * 48,
    fileType: 'application/pdf',
    extractionMethod: 'pdf-native',
    text: `Subject: Technical Assessment Project - Software Engineering Position
Dear Candidate,
Thank you for your interest in the Software Engineer position at Acme Corp. We've reviewed your application and would like to proceed with our technical assessment phase.
We believe in evaluating candidates through practical, real-world scenarios. Here's your project challenge:

Project: Document Summary Assistant is an application that takes any document (PDF/Image) and generates smart summaries.

Required Features:
1. Document Upload:
• Allow users to upload PDF files and image files (e.g., scanned documents).
• Support drag-and-drop or file picker interface for easy uploads.
2. Text Extraction:
• PDF Parsing: Extract text from PDFs while maintaining formatting.
• OCR (Optical Character Recognition): For image files (scanned documents), extract text using OCR technology (e.g., Tesseract).
3. Summary Generation:
• Automatically generate smart summaries of the document content.
• Provide options for summary length (short, medium, long).
• Highlight key points and main ideas, ensuring the summary captures essential information.
4. Improvement Suggestions & Smart Insights.
5. UI/UX:
• Simple, intuitive interface for uploading documents and viewing summaries.
• Mobile-responsive design for use on different devices.
6. Hosting:
• Deploy on a reliable hosting service (e.g., Netlify, Vercel, or Heroku) for easy access and scalability.

Deliverables:
1. Working application URL
2. GitHub repository with source code and README
3. Brief write-up of your approach (200 words max)

Timeline:
• Project deadline: September 1st, 2026
• Time investment: Maximum 8 hours

Evaluation Criteria:
• Problem-solving approach & code quality
• Working functionality & error handling
• Documentation & UX polish`,
  },
  {
    id: 'sample-cloud-sla',
    title: 'Enterprise Cloud Architecture & SLA',
    description: 'A multi-section cloud infrastructure contract detailing 99.99% uptime, latency SLAs, and disaster recovery.',
    category: 'PDF Document',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    fileName: 'Enterprise_Cloud_Architecture_SLA_2026.pdf',
    fileSize: 1024 * 142,
    fileType: 'application/pdf',
    extractionMethod: 'pdf-native',
    text: `ENTERPRISE CLOUD INFRASTRUCTURE & SERVICE LEVEL AGREEMENT (SLA)
Document Reference: ECA-2026-V4
Effective Date: October 1, 2026 | Renewal Date: September 30, 2027
Authorized Provider: ApexCloud Systems Inc. | Client: Global Distributed Corp.

1. EXECUTIVE OVERVIEW & ARCHITECTURE
ApexCloud Systems guarantees high-availability distributed infrastructure across multi-region Kubernetes clusters.
The infrastructure consists of:
• 3 Tier Multi-Region Active-Active Data Centers (US-East, US-West, EU-Central).
• Edge Caching CDN with under 25ms p95 global latency.
• Zero-trust network access (ZTNA) with mTLS encryption for all microservice communications.

2. SERVICE LEVEL OBJECTIVES (SLO) & UPTIME COMMITMENTS
• System Availability: 99.99% Monthly Uptime (excluding scheduled maintenance windows).
• Maximum Unscheduled Downtime: Less than 4.38 minutes per calendar month.
• API Response Time: Average latency <= 120ms; p99 latency <= 350ms under peak load (50,000 QPS).

3. FINANCIAL CREDITS & PENALTIES
If Monthly Uptime falls below commitments:
• 99.90% to 99.98%: 10% monthly service fee credit.
• 99.00% to 99.89%: 25% monthly service fee credit.
• Below 99.00%: 50% monthly service fee credit and immediate breach escalation.
Total annual contract value: $480,000 USD billed quarterly at $120,000 USD.

4. DISASTER RECOVERY & BACKUPS
• Recovery Point Objective (RPO): Maximum 5 minutes data loss.
• Recovery Time Objective (RTO): Service restored within 15 minutes of failover trigger.
• Full automated backups conducted every 6 hours and replicated across geographically distinct storage vaults.

5. ACTION ITEMS & GOVERNANCE
• Security audit and SOC2 Type II report submission deadline: November 15, 2026.
• Annual disaster recovery simulation exercise scheduled for December 5, 2026.
• Technical account review meetings held bi-weekly with Principal Architect Sarah Jenkins.`,
  },
  {
    id: 'sample-ocr-receipt',
    title: 'Scanned Commercial Invoice & Receipt',
    description: 'A scanned document demonstrating OCR text extraction from vendor billings, line items, and tax totals.',
    category: 'Scanned Image (OCR)',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    fileName: 'Scanned_Invoice_INV-88421.png',
    fileSize: 1024 * 96,
    fileType: 'image/png',
    extractionMethod: 'ocr-image',
    text: `[SCANNED INVOICE OCR OUTPUT - OPTICAL CHARACTER RECOGNITION]
INVOICE NUMBER: INV-88421
Date of Issue: August 14, 2026
Due Date: September 14, 2026 (Net 30 Days)
Vendor: Horizon Technology Solutions LLC, 450 Innovation Way, Suite 800, Austin TX 78701
Billed To: Quantum Dynamics Inc., Accounts Payable Dept, 1200 Market Street, San Francisco CA 94103

LINE ITEMS & SERVICES:
1. Senior Cloud Engineering Services (160 Hours @ $125.00/hr) ......... $20,000.00
2. AI Model Fine-tuning & Embeddings Pipeline Optimization .......... $6,500.00
3. Security Penetration Testing & Vulnerability Assessment .......... $4,800.00
4. Automated CI/CD Infrastructure Pipeline Setup .................. $3,200.00

SUBTOTAL: ........................................................... $34,500.00
STATE & LOCAL TAX (8.25%): .......................................... $2,846.25
DISCOUNT (Early Bird Payment 5%): .................................. -$1,725.00
TOTAL AMOUNT DUE: ................................................... $35,621.25

PAYMENT INSTRUCTIONS:
Wire Transfer / ACH: Chase Bank, Routing: 021000021, Account: 994821034
Contact for billing inquiries: finance@horizontech.io | Phone: (512) 555-0199
Late fee policy: 1.5% monthly surcharge assessed on balances unpaid after 30 days.`,
  },
];
