import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DocSummary AI | Intelligent PDF & Scanned Document Assistant',
  description: 'AI-powered document intelligence workspace that transforms PDFs and scanned documents into concise summaries, smart insights, and grounded answers.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50/60 text-slate-900 min-h-screen flex flex-col antialiased selection:bg-indigo-100 selection:text-indigo-900">
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <footer className="border-t border-slate-200/80 bg-white/60 py-6 text-center text-xs text-slate-500 print:hidden">
          <p>© 2026 DocSummary Assistant • Fast, reliable document processing, OCR & AI intelligence.</p>
        </footer>
      </body>
    </html>
  );
}
