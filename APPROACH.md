# Approach Write-Up (Document Summary Assistant)

The Document Summary Assistant is engineered using Next.js 15, TypeScript, and Tailwind CSS, prioritizing modular architecture, extraction fidelity, and an intuitive user experience.

Document ingestion employs a hybrid processing pipeline. Native PDFs are parsed using `unpdf`, preserving paragraph layout and structure without OS binary dependencies. Scanned documents and images (PNG, JPG, WEBP) are processed via `tesseract.js` OCR. Raw extracted text undergoes noise cleaning, character normalization, and reading metric estimation.

For AI summarization, the system interfaces with Google Gemini via a dedicated service layer. To guarantee factual faithfulness and prevent hallucinations, strict prompt constraints and low temperature (0.2) enforce structured JSON outputs. Long documents exceeding token boundaries are divided into overlapping chunks and synthesized through a map-reduce summarization strategy. The system generates customizable Short, Medium, and Long summaries, bulleted Key Points, and Actionable Suggestions, with an extractive fallback mode for offline resilience.

The frontend delivers drag-and-drop uploads, real-time multi-stage progress indicators, instant length switching on extracted text, a raw text inspector, and one-click Markdown export. The solution is fully responsive, tested with Vitest, and optimized for zero-configuration deployment on Vercel.
