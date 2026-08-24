'use client';

import React from 'react';
import { Sparkles, FileText, Image as ImageIcon, Zap, HelpCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { SAMPLE_DOCUMENTS, type SampleDocument } from '@/lib/sampleDocuments';

interface LandingHeroProps {
  onSelectSample: (sample: SampleDocument) => void;
  disabled?: boolean;
}

export default function LandingHero({ onSelectSample, disabled = false }: LandingHeroProps) {
  return (
    <div className="text-center max-w-3xl mx-auto space-y-6 pt-2 pb-4">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/90 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs">
        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
        <span>Document Intelligence Platform</span>
        <span className="text-slate-300">•</span>
        <span className="text-indigo-600 font-bold">PDF Parsing & OCR Engine</span>
      </div>

      {/* Main Headline */}
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Transform any document into{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900">
            clear, actionable intelligence
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Upload PDF documents or scanned image records to extract clean text, generate tailored multi-length summaries, extract smart insights, and chat directly with your document.
        </p>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-left">
        <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
            <FileText className="w-4 h-4" />
          </div>
          <p className="text-xs font-bold text-slate-800">Native PDF Parser</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Retains semantic paragraphs</p>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <ImageIcon className="w-4 h-4" />
          </div>
          <p className="text-xs font-bold text-slate-800">Tesseract OCR</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Scanned images & receipts</p>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
            <Zap className="w-4 h-4" />
          </div>
          <p className="text-xs font-bold text-slate-800">Smart Insights</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Dates, numbers & actions</p>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
            <HelpCircle className="w-4 h-4" />
          </div>
          <p className="text-xs font-bold text-slate-800">Ask Document</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Grounded Q&A with citations</p>
        </div>
      </div>

      {/* 1-Click Interactive Demo Documents for Reviewers */}
      <div className="pt-2">
        <div className="flex items-center justify-center gap-2 mb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            ⚡ Quick Test with Sample Documents:
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {SAMPLE_DOCUMENTS.map((doc) => (
            <button
              key={doc.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectSample(doc)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-indigo-600 text-xs font-medium transition-all shadow-2xs hover:border-indigo-300 disabled:opacity-50"
            >
              <span className={`w-2 h-2 rounded-full ${doc.extractionMethod === 'ocr-image' ? 'bg-amber-500' : 'bg-indigo-600'}`} />
              <span className="font-semibold">{doc.title}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md border ${doc.badgeColor}`}>
                {doc.category}
              </span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
