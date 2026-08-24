'use client';

import React from 'react';
import { Loader2, CheckCircle2, FileSearch, Sparkles, UploadCloud, RotateCcw, AlertTriangle } from 'lucide-react';
import type { ProcessingStage } from '@/types';

interface ProcessingStatusProps {
  stage: ProcessingStage;
  error?: string | null;
  onRetry?: () => void;
}

const STAGES = [
  { id: 'uploading', label: 'Uploading file', desc: 'Validating MIME & size constraints', icon: UploadCloud },
  { id: 'extracting', label: 'Extracting text & OCR', desc: 'Parsing PDF structure & OCR scans', icon: FileSearch },
  { id: 'analyzing', label: 'Analyzing structure', desc: 'Chunking & identifying key sections', icon: Sparkles },
  { id: 'summarizing', label: 'Synthesizing intelligence', desc: 'Generating summary & smart insights', icon: Sparkles },
];

export default function ProcessingStatus({ stage, error, onRetry }: ProcessingStatusProps) {
  if (stage === 'idle' || stage === 'completed') {
    return null;
  }

  const stageOrder = ['uploading', 'extracting', 'analyzing', 'summarizing'];
  const currentIndex = stageOrder.indexOf(stage);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm my-6 transition-all">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">Processing Document Pipeline</h3>
            {stage !== 'error' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200/60">
                <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
                Live Processing
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Extracting text layer, performing character recognition, and generating grounded AI intelligence.
          </p>
        </div>
      </div>

      {/* 4-Stage Stepper Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {STAGES.map((s, idx) => {
          const isDone = currentIndex > idx;
          const isCurrent = currentIndex === idx && stage !== 'error';
          const isUpcoming = currentIndex < idx;

          return (
            <div
              key={s.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                isDone
                  ? 'border-emerald-200 bg-emerald-50/50 text-emerald-900'
                  : isCurrent
                  ? 'border-indigo-500 bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'border-slate-200 bg-slate-50/50 text-slate-400'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-400 font-bold">
                    {idx + 1}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-bold truncate ${isCurrent ? 'text-indigo-950' : isDone ? 'text-emerald-900' : 'text-slate-500'}`}>
                  {s.label}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                  {isDone ? 'Completed' : isCurrent ? s.desc : 'Queued'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Error Banner with Retry Action */}
      {error && (
        <div className="mt-5 p-4 bg-red-50/90 border border-red-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-red-800 text-xs sm:text-sm">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
            <div>
              <p className="font-bold text-red-900">Document Processing Failed</p>
              <p className="text-xs text-red-700 mt-0.5 leading-relaxed">{error}</p>
            </div>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-red-300 text-red-800 hover:bg-red-50 text-xs font-bold transition-colors shadow-2xs self-end sm:self-center"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
