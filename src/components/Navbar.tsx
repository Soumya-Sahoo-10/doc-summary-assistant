'use client';

import React from 'react';
import { FileText, Sparkles, Clock, History, Github } from 'lucide-react';

interface NavbarProps {
  historyCount?: number;
  onOpenHistory?: () => void;
  onNewDocument?: () => void;
  isWorkspaceActive?: boolean;
}

export default function Navbar({
  historyCount = 0,
  onOpenHistory,
  onNewDocument,
  isWorkspaceActive = false,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div 
          onClick={onNewDocument}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md shadow-slate-900/10 group-hover:bg-indigo-600 transition-colors">
            <FileText className="w-5 h-5 text-slate-100 group-hover:scale-105 transition-transform" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-lg tracking-tight">DocSummary</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200/60 uppercase tracking-wider">
                <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                AI Intelligence
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              PDF & Scanned Image Document Assistant
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Engine Status */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50/80 text-emerald-800 rounded-full border border-emerald-200/70 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>PDF Engine & OCR Active</span>
          </div>

          {/* History Button */}
          {onOpenHistory && (
            <button
              type="button"
              onClick={onOpenHistory}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-xs font-medium transition-all shadow-xs"
              title="View recent document history"
            >
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span>Recent</span>
              {historyCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {historyCount}
                </span>
              )}
            </button>
          )}

          {/* New Document Button (if workspace active) */}
          {isWorkspaceActive && onNewDocument && (
            <button
              type="button"
              onClick={onNewDocument}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>New File</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
