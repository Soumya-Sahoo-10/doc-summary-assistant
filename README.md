# Document Summary Assistant

> An intelligent, full-stack web application that extracts text from PDFs and scanned images (via OCR) and generates structured, faithful AI summaries with key points and actionable insights.

---

## 🚀 Overview

**Document Summary Assistant** simplifies complex document review by accepting PDF and image files, parsing raw and scanned content, and utilizing Google Gemini AI to generate customized summaries (**Short**, **Medium**, **Long**), highlight critical **Key Points & Facts**, and provide **Actionable Insights**.

---

## ✨ Features

- 📄 **Multi-Format Ingestion**: Supports standard selectable PDFs and scanned image documents (PNG, JPG, JPEG, WEBP).
- 🖱️ **Drag-and-Drop Interface**: Smooth file dropzone with instant client-side validation for file type and size (up to 10MB).
- 🔍 **Hybrid Text Extraction**:
  - Native PDF text extraction preserving section structure and paragraphs.
  - Tesseract OCR engine for scanned images.
- 🤖 **Intelligent AI Summarization**:
  - **Short Mode**: 1–2 paragraphs for quick executive briefing (~100–150 words).
  - **Medium Mode**: 2–4 paragraphs covering context, findings, and takeaways (~250–400 words).
  - **Long Mode**: Comprehensive multi-section analysis with deep coverage (~500–800 words).
  - **Key Points & Facts**: High-impact bullet points capturing crucial statistics, dates, and conclusions.
  - **Insights & Suggestions**: Practical takeaways and recommendations derived from the document.
- ⚡ **Instant Length Re-generation**: Switch between Short, Medium, and Long summaries immediately without re-uploading the file.
- 📋 **Extracted Text Inspector**: Collapsible viewer to audit raw extracted text with copy-to-clipboard.
- 💾 **Export & Copy**: Copy full summary or download as Markdown (`.md`) with one click.
- 🛡️ **Zero-Failure Fallback Mode**: Intelligent rule-based extractive summary engine when offline or if an API key is not configured.
- 📱 **Fully Responsive UI**: Modern, clean design built with Tailwind CSS, Lucide icons, and accessible components.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Components & Route Handlers)
- **Frontend**: [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/)
- **Document Processing**:
  - `unpdf`: Lightweight, universal PDF text parsing without heavy canvas binary dependencies.
  - `tesseract.js`: Pure JavaScript/WASM Optical Character Recognition (OCR) for scanned images.
- **AI Integration**: `@google/generative-ai` & `@google/genai` (Gemini 2.5 Flash / Gemini 1.5 Flash)
- **Testing**: [Vitest](https://vitest.dev/) for unit and integration testing.

---

## 🏛️ Architecture

```
[ User Browser / Client UI ]
   ├── Drag & Drop / File Picker (PDF, PNG, JPG, JPEG, WEBP)
   ├── Length Mode Selector (Short, Medium, Long)
   ├── Multi-Stage Progress State Indicator
   └── Results Dashboard (Summary, Key Points, Extracted Text Accordion)
                          │
                          ▼ (FormData / JSON REST API)
[ Next.js API Routes / Server Handlers ]
   ├── POST /api/process-document (Upload -> Validation -> Extraction -> Summarization)
   └── POST /api/summarize-text   (Re-summarize extracted text with new length)
                          │
        ┌─────────────────┴──────────────────┐
        ▼                                    ▼
[ Document Processing Service ]    [ AI Summarization Service ]
  ├── File Validator (MIME/size)     ├── Token & Text Estimator
  ├── PDF Extractor (unpdf)          ├── Long Document Chunker (Map-Reduce)
  └── OCR Engine (Tesseract.js)      └── Google Gemini Engine (with Fallback)
```

---

## 🔄 How It Works & API Flow

1. **Upload & Validation**: User selects or drops a document. The client and server validate file format and enforce the 10MB limit.
2. **Text Extraction**:
   - For **PDFs**: `unpdf` parses the document proxy and extracts formatted text.
   - For **Images**: `tesseract.js` worker processes the image and extracts text via OCR.
3. **Text Cleaning & Metrics**: Strips binary noise, normalizes line breaks, and calculates word count and read time.
4. **AI Summarization**:
   - For long documents (>12,000 characters), a map-reduce chunking strategy summarizes sections before synthesizing the final summary.
   - Low temperature (0.2) ensures strict factual fidelity without hallucination.
   - Returns structured JSON containing executive summary, key points, main ideas, and improvement suggestions.

---

## 📦 Installation & Running Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.17+ or v20+ recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

### Steps

1. **Open project directory**:
   ```bash
   cd D:\doc-summary-assistant
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local`:
   ```bash
   copy .env.example .env.local
   ```
   Add your Gemini API key (free from [Google AI Studio](https://aistudio.google.com/app/apikey)):
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key
   ```
   *(Note: The app also includes a zero-config fallback mode if no API key is provided).*

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Run Automated Tests**:
   ```bash
   npm run test
   ```

6. **Build for Production**:
   ```bash
   npm run build
   npm run start
   ```

---

## 🔍 OCR Approach

- **Engine**: `tesseract.js` executes WebAssembly-compiled Tesseract OCR natively within the Node.js/browser runtime.
- **Benefits**: No complex C++ or OS-level binary dependencies (like poppler or native tesseract-ocr binaries) required on the server, making the app 100% portable and deployable to serverless platforms like Vercel or Netlify.
- **Preprocessing**: Cleans noisy characters and validates extracted word count before forwarding to the AI layer.

---

## 🤖 AI Summarization Approach

- **Model**: Google Gemini (`gemini-2.5-flash` / `gemini-1.5-flash`) for low latency and high accuracy.
- **Faithfulness Guarantee**: Strict system prompt constraints prohibit external assumptions or ungrounded claims.
- **Handling Long Documents**: Overlapping chunking mechanism with map-reduce summarization ensures large multi-page reports fit comfortably within token windows without truncation.
- **Structured Output**: Strictly enforced JSON schema for reliable UI rendering.

---

## 🛡️ Error Handling & Security

- **File Validation**: Multi-layer MIME type, extension, and file size checks prevent unauthorized file ingestion.
- **Input Sanitization**: File names are sanitized against path traversal attacks.
- **No Secrets in Client**: API keys remain strictly server-side.
- **Graceful Degenerative State**: If an OCR or AI network failure occurs, the UI displays clear, user-friendly feedback without freezing or crashing.

---

## 🌐 Deployment

The application is fully compatible with **Vercel**, **Netlify**, or standard Node hosting:

1. Push this repository to GitHub.
2. Import the repository into Vercel / Netlify.
3. Add the `GEMINI_API_KEY` environment variable in the dashboard.
4. Deploy!
