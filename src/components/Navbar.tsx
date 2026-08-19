import React from 'react';
import { FileText, Sparkles } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-lg tracking-tight">DocSummary</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200/60">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                AI Assistant
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Intelligent PDF & Image Document Summarizer</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            PDF Parser & OCR Active
          </span>
        </div>
      </div>
    </header>
  );
}
