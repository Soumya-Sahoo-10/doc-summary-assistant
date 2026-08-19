'use client';

import React from 'react';
import { Loader2, CheckCircle2, FileSearch, Sparkles, UploadCloud } from 'lucide-react';
import type { ProcessingStage } from '@/types';

interface ProcessingStatusProps {
  stage: ProcessingStage;
  error?: string | null;
}

const STAGES = [
  { id: 'uploading', label: 'Uploading file', icon: UploadCloud },
  { id: 'extracting', label: 'Extracting text & OCR', icon: FileSearch },
  { id: 'analyzing', label: 'Analyzing document structure', icon: Sparkles },
  { id: 'summarizing', label: 'Generating AI summary', icon: Sparkles },
];

export default function ProcessingStatus({ stage, error }: ProcessingStatusProps) {
  if (stage === 'idle' || stage === 'completed') {
    return null;
  }

  const stageOrder = ['uploading', 'extracting', 'analyzing', 'summarizing'];
  const currentIndex = stageOrder.indexOf(stage);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm my-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-slate-900 text-base">Processing Document</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Extracting text and applying AI summarization...
          </p>
        </div>
        {stage !== 'error' && (
          <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full text-xs font-medium border border-indigo-100">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>In Progress</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {STAGES.map((s, idx) => {
          const isDone = currentIndex > idx;
          const isCurrent = currentIndex === idx && stage !== 'error';
          const isUpcoming = currentIndex < idx;

          return (
            <div
              key={s.id}
              className={`p-3.5 rounded-xl border transition-all flex items-center gap-3 ${
                isDone
                  ? 'border-emerald-200 bg-emerald-50/50 text-emerald-800'
                  : isCurrent
                  ? 'border-indigo-500 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 bg-slate-50/50 text-slate-400'
              }`}
            >
              <div className="flex-shrink-0">
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
                <p className="text-xs font-semibold truncate">{s.label}</p>
                <p className="text-[10px] opacity-75">
                  {isDone ? 'Completed' : isCurrent ? 'Working...' : 'Waiting'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}
