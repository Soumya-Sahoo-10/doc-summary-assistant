import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Document Summary Assistant | Smart PDF & Image Summarizer',
  description: 'Upload PDF and image documents to extract text and generate smart AI-powered summaries with key points.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          <p>© 2026 Document Summary Assistant. Fast, reliable document processing & AI summarization.</p>
        </footer>
      </body>
    </html>
  );
}
