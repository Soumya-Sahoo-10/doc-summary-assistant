'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Check, FileText } from 'lucide-react';
import type { DocumentMetadata } from '@/types';

interface ExtractedTextViewerProps {
  extractedText: string;
  metadata?: DocumentMetadata;
}

export default function ExtractedTextViewer({ extractedText, metadata }: ExtractedTextViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  if (!extractedText) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mt-6 transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-slate-50/70 hover:bg-slate-100/70 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800">
              Extracted Raw Document Text
            </h4>
            <p className="text-xs text-slate-500">
              {metadata?.wordCount || extractedText.split(/\s+/).filter(Boolean).length} words •{' '}
              {metadata?.characterCount || extractedText.length} characters • Method:{' '}
              <span className="capitalize font-medium text-slate-700">
                {metadata?.extractionMethod || 'text-extraction'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            {isOpen ? 'Collapse' : 'Inspect Text'}
          </span>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="p-6 border-t border-slate-200 bg-slate-50/30">
          <div className="flex justify-end mb-3">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied to clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy raw text</span>
                </>
              )}
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs leading-relaxed whitespace-pre-wrap select-text border border-slate-800">
            {extractedText}
          </div>
        </div>
      )}
    </div>
  );
}
