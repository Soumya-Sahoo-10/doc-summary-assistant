# DocSummary AI — Intelligent Document Intelligence & Summary Assistant

> An AI-powered document intelligence workspace that transforms PDFs and scanned documents into concise summaries, actionable smart insights, and grounded interactive Q&A with verifiable citations.

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-3.0-green?style=flat-square&logo=vitest)](https://vitest.dev/)

---

## 🚀 Overview

**DocSummary AI** is a modern document intelligence workspace designed to solve document overload. Instead of skimming through multi-page contracts, technical specifications, research papers, or scanned receipts, users can upload documents or select demo files to extract text, generate structured executive summaries, track action items and deadlines, and chat interactively with the document with verifiable citations.

---

## 🌟 Key Differentiators & Features

### 1. 📄 Multi-Format Ingestion & Hybrid Extraction
- **Native PDF Parsing**: Extracts text from digital PDFs (`pdf-parse`) while preserving structural hierarchy and paragraph breaks.
- **Tesseract OCR Engine**: Performs Optical Character Recognition (`tesseract.js`) for scanned documents, images (PNG, JPG, JPEG, WEBP), and receipts without external C++ binary dependencies.
- **Validation**: Enforces strict MIME checks and a 10MB size ceiling with human-friendly alerts.

### 2. 🤖 Tailored AI Summarization
- **Short Mode**: 1–2 high-level executive paragraphs (~100–150 words) for rapid briefing.
- **Medium Mode**: 2–4 structured paragraphs (~250–400 words) balancing context, methodology, and conclusions.
- **Long Mode**: In-depth executive breakdown (~500–800 words) capturing critical nuances and details.
- **Instant Re-generation**: Switch between Short, Medium, and Long summaries on the fly without re-uploading or re-parsing the document.
- **Key Points & Facts**: High-impact bullet points with key numbers, dates, and takeaways.

### 3. 💬 "Ask This Document" (Grounded Q&A with Citations)
- Interactive document chat enabling users to ask any question about the text.
- **Strict Grounding**: The AI answers strictly using the document context and refuses to hallucinate facts not present.
- **Verifiable Citations**: Every answer highlights exact excerpt quotes from the source document.
- **Dynamic Suggested Prompts**: Automatically generates document-specific question suggestions to guide exploration.

### 4. 💡 Smart Insights Extraction
- **Action Items & Deliverables**: Automatically identifies required tasks with category badges (*Urgent*, *Review*, *Follow-up*) and interactive checkboxes.
- **Key Dates & Deadlines**: Formats critical dates and milestones into a timeline view.
- **Important Figures & Metrics**: Highlights financial figures, percentages, and quantitative metrics.
- **Recognized Entities**: Extracts companies, organizations, technologies, and people mentioned.

### 5. ⚡ 1-Click Interactive Reviewer Demos
- Pre-loaded with 3 realistic sample documents for instant testing without uploading files:
  1. *Software Engineer Technical Assessment Spec* (PDF)
  2. *Enterprise Cloud Architecture & SLA Agreement* (Multi-section PDF)
  3. *Scanned Commercial Invoice & Receipt* (OCR Demo)

### 6. 🕒 Local Session History
- Saves analyzed documents to browser `localStorage`.
- Allows reopening past documents, summaries, insights, and raw text with one click.

### 7. 📤 Multi-Format Exporting & Print Report
- **Copy Formatted Summary**: Formatted clipboard copy.
- **Download Markdown (`.md`)**: Full intelligence report formatted in Markdown.
- **Print / PDF Export**: Styled `@media print` layout for saving clean executive PDF reports via browser print.

---

## 🏛️ System Architecture

```
[ User Browser / Client UI ]
   ├── Drag & Drop / File Picker (PDF, PNG, JPG, JPEG, WEBP)
   ├── 1-Click Sample Document Selector
   ├── Document Intelligence Workspace (Tabs: Summary | Insights | Q&A | Text)
   └── Local Session History (localStorage)
                          │
                          ▼ (FormData / JSON REST API)
[ Next.js API Routes / Server Handlers ]
   ├── POST /api/process-document (Upload -> Validation -> Extraction -> Summarization)
   ├── POST /api/summarize-text   (Re-summarize existing text with new length)
   └── POST /api/ask-document     (Grounded Q&A with verifiable source citations)
                          │
        ┌─────────────────┼──────────────────┐
        ▼                 ▼                  ▼
[ Document Processor ] [ AI Summarizer ] [ Document Q&A ]
  ├── File Validator     ├── Prompt Schema   ├── Grounded Prompt
  ├── PDF Extractor      ├── Map-Reduce      ├── Quote Citations
  └── Tesseract OCR      └── Smart Insights  └── Offline Ranker
```

---

## 🔄 Document Processing Pipeline

```
1. INGESTION
   ├── Validate MIME (PDF / PNG / JPG / JPEG / WEBP) & Size (<= 10MB)
   └── Sanitize filename against path traversal

2. EXTRACTION
   ├── If PDF  → Parse digital text stream via Buffer (`pdf-parse`)
   └── If Image → Execute WASM worker via Tesseract OCR (`tesseract.js`)

3. NORMALIZATION & METRICS
   ├── Clean non-printable bytes, normalize whitespace & paragraph breaks
   └── Compute word count, character count, and estimated read time

4. INTELLIGENCE SYNTHESIS
   ├── If tokens > 12k chars → Map-reduce chunking strategy
   ├── Call Gemini 1.5 Flash (temperature 0.1-0.2 for strict fidelity)
   └── Extract: Summary + Key Points + Smart Insights + Suggested Questions
```

---

## 📦 Installation & Local Setup

### Prerequisites
- **Node.js**: v18.17+ or v20+
- **npm** or **pnpm**

### Quick Start

1. **Clone & Navigate**:
   ```bash
   git clone https://github.com/Soumya-Sahoo-10/doc-summary-assistant.git
   cd doc-summary-assistant
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local`:
   ```bash
   copy .env.example .env.local
   ```
   Add your free Google Gemini API Key ([Google AI Studio](https://aistudio.google.com/app/apikey)):
   ```env
   GEMINI_API_KEY=AIzaSy...
   ```
   *(Note: The app includes an offline fallback engine that runs without an API key).*

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Run Automated Tests**:
   ```bash
   npm run test
   ```

6. **Production Build**:
   ```bash
   npm run build
   npm run start
   ```

---

## 🧪 Testing Coverage

The project includes unit tests for core services:
- `tests/validators.test.ts`: MIME checking, file size limits, name sanitization, text metrics.
- `tests/chunking.test.ts`: Overlapping chunking algorithms for large multi-page texts.
- `tests/summarizer.test.ts`: Multi-length summary synthesis and offline extractive fallback.
- `tests/qa.test.ts`: Grounded Q&A retrieval and citation verification.
- `tests/smartInsights.test.ts`: Extraction of action items, dates, and quantitative figures.

---

## 🌐 Deployment

The application is optimized for zero-configuration deployment on **Vercel** or **Netlify**:

1. Push to GitHub.
2. Import repository on [Vercel](https://vercel.com).
3. Set `GEMINI_API_KEY` under Project Environment Variables.
4. Click **Deploy**.
