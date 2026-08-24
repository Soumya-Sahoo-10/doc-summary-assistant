'use client';

import React from 'react';
import { X, Clock, FileText, Image as ImageIcon, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import type { DocumentHistoryItem } from '@/types';

interface RecentDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: DocumentHistoryItem[];
  onSelectDocument: (doc: DocumentHistoryItem) => void;
  onDeleteDocument: (id: string) => void;
  onClearAll: () => void;
}

export default function RecentDocumentsModal({
  isOpen,
  onClose,
  history,
  onSelectDocument,
  onDeleteDocument,
  onClearAll,
}: RecentDocumentsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Document History</h3>
              <p className="text-xs text-slate-500">Access previously analyzed documents instantly</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">No recent documents yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Documents you upload and process will automatically be saved here for quick recall.
              </p>
            </div>
          ) : (
            history.map((doc) => {
              const isImage = doc.extractionMethod === 'ocr-image';
              const formattedDate = new Date(doc.processedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={doc.id}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition-all flex items-center justify-between gap-3 group"
                >
                  <div
                    onClick={() => onSelectDocument(doc)}
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-indigo-100 text-slate-700 group-hover:text-indigo-700 flex items-center justify-center flex-shrink-0 transition-colors">
                      {isImage ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-indigo-700 transition-colors">
                        {doc.fileName}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <span>{doc.wordCount} words</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700 capitalize">
                          {isImage ? 'OCR Scan' : 'PDF Native'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => onSelectDocument(doc)}
                      className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="Open document"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteDocument(doc.id)}
                      className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                      title="Remove from history"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">{history.length} saved document(s)</span>
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs text-red-600 hover:text-red-700 font-semibold hover:underline"
            >
              Clear all history
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
