'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Clock,
  FileCheck,
  RotateCcw,
  Lightbulb,
  ArrowRight,
  ListFilter,
} from 'lucide-react';
import type { DocumentMetadata, SummaryLength, SummaryResult } from '@/types';

interface SummaryResultViewProps {
  summaryResult: SummaryResult;
  metadata?: DocumentMetadata;
  extractedText: string;
  onReSummarize: (newLength: SummaryLength) => void;
  isReSummarizing: boolean;
  onReset: () => void;
}

export default function SummaryResultView({
  summaryResult,
  metadata,
  extractedText,
  onReSummarize,
  isReSummarizing,
  onReset,
}: SummaryResultViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopySummary = async () => {
    try {
      const fullText = `DOCUMENT SUMMARY (${summaryResult.requestedLength.toUpperCase()})
Document: ${metadata?.fileName || 'Uploaded Document'}

SUMMARY:
${summaryResult.summary}

KEY POINTS:
${summaryResult.keyPoints.map((kp) => `• ${kp}`).join('\n')}

${
  summaryResult.mainIdeas && summaryResult.mainIdeas.length > 0
    ? `MAIN IDEAS:\n${summaryResult.mainIdeas.map((mi) => `• ${mi}`).join('\n')}\n`
    : ''
}
${
  summaryResult.improvementSuggestions && summaryResult.improvementSuggestions.length > 0
    ? `IMPROVEMENT SUGGESTIONS:\n${summaryResult.improvementSuggestions
        .map((is) => `• ${is}`)
        .join('\n')}\n`
    : ''
}`;
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleDownload = () => {
    const markdownContent = `# Document Summary: ${metadata?.fileName || 'Document'}

- **Generated**: ${new Date().toLocaleString()}
- **Length Mode**: ${summaryResult.requestedLength.toUpperCase()}
- **Model / Engine**: ${summaryResult.modelUsed}
- **Source Words**: ${metadata?.wordCount || 'N/A'}
- **Estimated Reading Time**: ~${summaryResult.estimatedReadTimeMinutes} min

---

## 📌 Executive Summary

${summaryResult.summary}

---

## 🎯 Key Points & Takeaways

${summaryResult.keyPoints.map((kp) => `- ${kp}`).join('\n')}

${
  summaryResult.mainIdeas && summaryResult.mainIdeas.length > 0
    ? `\n## 💡 Core Themes & Main Ideas\n\n${summaryResult.mainIdeas
        .map((mi) => `- ${mi}`)
        .join('\n')}\n`
    : ''
}
${
  summaryResult.improvementSuggestions && summaryResult.improvementSuggestions.length > 0
    ? `\n## 🚀 Actionable Insights & Suggestions\n\n${summaryResult.improvementSuggestions
        .map((is) => `- ${is}`)
        .join('\n')}\n`
    : ''
}
`;

    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${metadata?.fileName ? metadata.fileName.replace(/\.[^/.]+$/, '') : 'document'}-summary.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <FileCheck className="w-5 h-5" />
            </span>
            <h3 className="font-bold text-slate-900 text-lg sm:text-xl truncate max-w-md">
              {metadata?.fileName || 'Document Summary'}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              ~{summaryResult.estimatedReadTimeMinutes} min read
            </span>
            <span>•</span>
            <span>{metadata?.wordCount || 0} source words</span>
            <span>•</span>
            <span className="capitalize text-slate-700 font-medium">
              Mode: {summaryResult.requestedLength}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Copy Summary</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Download .MD</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>New File</span>
          </button>
        </div>
      </div>

      {/* Length Switcher with Instant Re-generation */}
      <div className="bg-slate-100/80 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200 max-w-md">
        <span className="text-xs font-semibold text-slate-500 px-3 flex items-center gap-1">
          <ListFilter className="w-3.5 h-3.5" />
          Switch Length:
        </span>
        {(['short', 'medium', 'long'] as SummaryLength[]).map((len) => (
          <button
            key={len}
            type="button"
            disabled={isReSummarizing}
            onClick={() => {
              if (len !== summaryResult.requestedLength) {
                onReSummarize(len);
              }
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-xl capitalize transition-all ${
              summaryResult.requestedLength === len
                ? 'bg-white text-indigo-600 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isReSummarizing && summaryResult.requestedLength === len ? 'Generating...' : len}
          </button>
        ))}
      </div>

      {/* Main Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h4 className="text-base font-bold text-slate-900">Executive Summary</h4>
        </div>
        <div className="text-slate-800 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line">
          {summaryResult.summary}
        </div>
      </div>

      {/* Key Points Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Key Points */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h4 className="text-base font-bold text-slate-900">Key Points & Facts</h4>
          </div>
          <ul className="space-y-3">
            {summaryResult.keyPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                <span className="leading-snug">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Improvement Suggestions / Main Ideas */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h4 className="text-base font-bold text-slate-900">
              {summaryResult.improvementSuggestions && summaryResult.improvementSuggestions.length > 0
                ? 'Insights & Suggestions'
                : 'Core Themes'}
            </h4>
          </div>
          <ul className="space-y-3">
            {(summaryResult.improvementSuggestions && summaryResult.improvementSuggestions.length > 0
              ? summaryResult.improvementSuggestions
              : summaryResult.mainIdeas
            ).map((item, index) => (
              <li key={index} className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
