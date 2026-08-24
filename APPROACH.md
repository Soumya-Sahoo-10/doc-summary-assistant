# Approach Write-Up (DocSummary AI)

DocSummary AI is built with Next.js 15, TypeScript, and Tailwind CSS, delivering a modular, production-ready document intelligence workspace.

Document ingestion uses a hybrid extraction pipeline. Native PDFs are parsed in-memory via `pdf-parse`, preserving paragraph hierarchies without native binary dependencies. Scanned documents and images (PNG, JPG, WEBP) are processed via `tesseract.js` OCR. Extracted text undergoes character normalization, noise removal, and reading metric estimation.

For AI intelligence, the platform interfaces with Google Gemini using structured prompt engineering with low temperature (0.1–0.2) to prevent hallucinations. For long documents, an overlapping map-reduce chunking strategy synthesizes intermediate sections. Beyond multi-length summaries (Short, Medium, Long), the system extracts Smart Insights (action items, key dates, financial metrics, recognized entities) and powers an interactive 'Ask This Document' Q&A engine with grounded source citations. An offline extractive fallback guarantees zero-crash resilience.

The frontend features drag-and-drop ingestion, 1-click sample demo documents, multi-stage progress tracking, dynamic length switching, local session history, raw text search, and multi-format exports (Markdown, Plain Text, Print/PDF). The solution is fully responsive and deployed on Vercel.
