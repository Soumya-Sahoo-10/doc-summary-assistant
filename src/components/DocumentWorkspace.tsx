'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  ListFilter,
  HelpCircle,
  Zap,
  FileText,
  Search,
  Send,
  Loader2,
  Printer,
  Calendar,
  DollarSign,
  Building2,
  CheckSquare,
  Square,
  Quote,
  Layers,
  Sliders,
  UserCheck,
} from 'lucide-react';
import type {
  DocumentMetadata,
  SummaryLength,
  SummaryTone,
  SummaryResult,
  ActionItem,
  QAMessage,
  AskDocumentResponse,
} from '@/types';

interface DocumentWorkspaceProps {
  summaryResult: SummaryResult;
  metadata?: DocumentMetadata;
  extractedText: string;
  onReSummarize: (newLength: SummaryLength, newTone?: SummaryTone) => void;
  isReSummarizing: boolean;
  onReset: () => void;
}

type WorkspaceTab = 'summary' | 'insights' | 'qa' | 'text';

export default function DocumentWorkspace({
  summaryResult,
  metadata,
  extractedText,
  onReSummarize,
  isReSummarizing,
  onReset,
}: DocumentWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('summary');
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedAnswerId, setCopiedAnswerId] = useState<string | null>(null);

  const selectedTone = summaryResult.requestedTone || 'executive';

  // Smart Insights state (allows checking off action items)
  const [actionItems, setActionItems] = useState<ActionItem[]>(
    summaryResult.smartInsights?.actionItems || []
  );

  useEffect(() => {
    if (summaryResult.smartInsights?.actionItems) {
      setActionItems(summaryResult.smartInsights.actionItems);
    }
  }, [summaryResult]);

  const toggleActionItem = (id: string) => {
    setActionItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  // Q&A state
  const [qaMessages, setQaMessages] = useState<QAMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `Hello! I have indexed **${metadata?.fileName || 'your document'}**. You can ask any specific question about its content, figures, decisions, or timeline, and I will provide answers strictly grounded in the document with source citations.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [questionInput, setQuestionInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'qa') {
      scrollToBottom();
    }
  }, [qaMessages, activeTab]);

  const handleAskQuestion = async (queryText?: string) => {
    const question = (queryText || questionInput).trim();
    if (!question || isAsking || !extractedText) return;

    const userMessage: QAMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setQaMessages((prev) => [...prev, userMessage]);
    if (!queryText) setQuestionInput('');
    setIsAsking(true);

    try {
      const historyPayload = qaMessages
        .filter((m) => m.id !== 'welcome-msg')
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/ask-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: extractedText,
          question,
          fileName: metadata?.fileName,
          history: historyPayload,
        }),
      });

      const data: AskDocumentResponse = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to answer question.');
      }

      const botMessage: QAMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.answer || 'No answer generated.',
        sources: data.sources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setQaMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      const errorMessage: QAMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `I encountered an issue: ${err.message || 'Could not retrieve answer'}. Please try asking again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setQaMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleCopyAnswer = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAnswerId(id);
      setTimeout(() => setCopiedAnswerId(null), 2000);
    } catch {
      // ignore
    }
  };

  // Text Inspector Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Export handlers
  const handleCopySummary = async () => {
    try {
      const textToCopy = `DOCUMENT INTELLIGENCE REPORT
Document: ${metadata?.fileName || 'Uploaded Document'}
Detail Level: ${summaryResult.requestedLength.toUpperCase()} | Tone: ${selectedTone.toUpperCase()}

EXECUTIVE SUMMARY:
${summaryResult.summary}

KEY POINTS & FACTS:
${summaryResult.keyPoints.map((kp) => `• ${kp}`).join('\n')}

${summaryResult.mainIdeas?.length ? `CORE THEMES:\n${summaryResult.mainIdeas.map((mi) => `• ${mi}`).join('\n')}\n` : ''}
${summaryResult.improvementSuggestions?.length ? `ACTIONABLE TAKEAWAYS:\n${summaryResult.improvementSuggestions.map((is) => `• ${is}`).join('\n')}\n` : ''}`;

      await navigator.clipboard.writeText(textToCopy);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleDownloadMarkdown = () => {
    const md = `# Document Intelligence Report: ${metadata?.fileName || 'Document'}

- **Generated**: ${new Date().toLocaleString()}
- **Detail Level**: ${summaryResult.requestedLength.toUpperCase()}
- **Tone Persona**: ${selectedTone.toUpperCase()}
- **Engine**: ${summaryResult.modelUsed}
- **Source Words**: ${metadata?.wordCount || 'N/A'}
- **Reading Time**: ~${summaryResult.estimatedReadTimeMinutes} min

---

## 📌 Executive Summary

${summaryResult.summary}

---

## 🎯 Key Points & Critical Facts

${summaryResult.keyPoints.map((kp) => `- ${kp}`).join('\n')}

${
  summaryResult.mainIdeas?.length
    ? `\n## 💡 Core Themes & Main Ideas\n\n${summaryResult.mainIdeas.map((mi) => `- ${mi}`).join('\n')}\n`
    : ''
}
${
  summaryResult.smartInsights?.actionItems?.length
    ? `\n## ✅ Action Items & Deliverables\n\n${summaryResult.smartInsights.actionItems
        .map((act) => `- [${act.completed ? 'x' : ' '}] **${act.category || 'Action'}**: ${act.text}`)
        .join('\n')}\n`
    : ''
}
${
  summaryResult.smartInsights?.importantDates?.length
    ? `\n## 📅 Key Dates & Deadlines\n\n${summaryResult.smartInsights.importantDates
        .map((d) => `- **${d.date}**: ${d.description}`)
        .join('\n')}\n`
    : ''
}
${
  summaryResult.smartInsights?.importantNumbers?.length
    ? `\n## 🔢 Key Metrics & Numbers\n\n${summaryResult.smartInsights.importantNumbers
        .map((n) => `- **${n.metric}**: ${n.value} (${n.context})`)
        .join('\n')}\n`
    : ''
}
`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${metadata?.fileName ? metadata.fileName.replace(/\.[^/.]+$/, '') : 'document'}-intelligence-report.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const isOcr = metadata?.extractionMethod === 'ocr-image';

  return (
    <div className="space-y-6">
      {/* Top Workspace Command Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Document Info */}
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <FileCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                {metadata?.fileName || 'Processed Document'}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-500">
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  ~{summaryResult.estimatedReadTimeMinutes} min read
                </span>
                <span>•</span>
                <span>{metadata?.wordCount || 0} words</span>
                <span>•</span>
                <span>{metadata?.characterCount || 0} chars</span>
                <span>•</span>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                    isOcr
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                  }`}
                >
                  {isOcr ? 'Tesseract OCR Scan' : 'Native PDF'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Summary Length Switcher */}
          <div className="bg-slate-100/90 p-1 rounded-xl flex items-center gap-1 border border-slate-200 text-xs">
            <span className="text-[11px] font-bold text-slate-500 px-2 hidden sm:inline">Length:</span>
            {(['short', 'medium', 'long'] as SummaryLength[]).map((len) => (
              <button
                key={len}
                type="button"
                disabled={isReSummarizing}
                onClick={() => {
                  if (len !== summaryResult.requestedLength) {
                    onReSummarize(len, selectedTone);
                  }
                }}
                className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all ${
                  summaryResult.requestedLength === len
                    ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isReSummarizing && summaryResult.requestedLength === len ? '...' : len}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-2xs"
            title="Copy formatted summary"
          >
            {copiedSummary ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadMarkdown}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-2xs"
            title="Download report as Markdown"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export</span> .MD
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-2xs"
            title="Print or export clean PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-all shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New File</span>
          </button>
        </div>
      </div>

      {/* Modern Tab Navigation */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('summary')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'summary'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Executive Summary</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('insights')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'insights'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Smart Insights</span>
          {summaryResult.smartInsights?.actionItems?.length ? (
            <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">
              {summaryResult.smartInsights.actionItems.length}
            </span>
          ) : null}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('qa')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'qa'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-purple-600" />
          <span>Ask This Document</span>
          <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded-full text-[10px] font-bold">
            Grounded Q&A
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('text')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'text'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4 text-slate-500" />
          <span>Extracted Text</span>
        </button>
      </div>

      {/* TAB CONTENT 1: EXECUTIVE SUMMARY */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          {/* Persona / Tone Selector */}
          <div className="bg-slate-100/70 p-2 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 px-2 font-semibold">
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Explain As Persona:</span>
            </div>
            <div className="flex flex-wrap items-center gap-1 text-xs">
              {(
                [
                  { id: 'executive', label: 'Executive' },
                  { id: 'simple', label: 'Simple / ELI5' },
                  { id: 'technical', label: 'Technical' },
                  { id: 'student', label: 'Student' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  disabled={isReSummarizing}
                  onClick={() => onReSummarize(summaryResult.requestedLength, t.id)}
                  className={`px-3 py-1 rounded-xl font-bold transition-all ${
                    selectedTone === t.id
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  {isReSummarizing && selectedTone === t.id ? 'Updating...' : t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Executive Summary Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Executive Summary</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full capitalize">
                  {summaryResult.requestedLength} Format
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full capitalize border border-indigo-200/60">
                  {selectedTone} Tone
                </span>
              </div>
            </div>
            <div className="text-slate-800 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line">
              {summaryResult.summary}
            </div>
          </div>

          {/* Key Points & Core Themes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Points & Facts */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h4 className="text-sm sm:text-base font-bold text-slate-900">Key Points & Facts</h4>
              </div>
              <ul className="space-y-3">
                {summaryResult.keyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Core Themes & Actionable Takeaways */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h4 className="text-sm sm:text-base font-bold text-slate-900">
                  {summaryResult.improvementSuggestions?.length ? 'Actionable Takeaways' : 'Core Themes'}
                </h4>
              </div>
              <ul className="space-y-3">
                {(summaryResult.improvementSuggestions?.length
                  ? summaryResult.improvementSuggestions
                  : summaryResult.mainIdeas || []
                ).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: SMART INSIGHTS */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* Action Items Checklist */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Action Items & Deliverables</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">Click checkbox to mark complete</span>
            </div>

            {actionItems.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No explicit action items detected in this document.</p>
            ) : (
              <div className="space-y-3">
                {actionItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleActionItem(item.id)}
                    className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer select-none ${
                      item.completed
                        ? 'bg-slate-50 border-slate-200 text-slate-400'
                        : 'bg-white border-slate-200/90 hover:border-indigo-300 shadow-2xs'
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0 text-indigo-600">
                      {item.completed ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs sm:text-sm leading-relaxed ${
                          item.completed ? 'line-through text-slate-400 font-normal' : 'text-slate-800 font-medium'
                        }`}
                      >
                        {item.text}
                      </p>
                    </div>
                    {item.category && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex-shrink-0 ${
                          item.category === 'Urgent'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : item.category === 'Review'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}
                      >
                        {item.category}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dates & Numbers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Dates & Milestones */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h4 className="text-sm sm:text-base font-bold text-slate-900">Key Dates & Deadlines</h4>
              </div>
              {summaryResult.smartInsights?.importantDates?.length ? (
                <div className="space-y-3">
                  {summaryResult.smartInsights.importantDates.map((dateObj, idx) => (
                    <div key={idx} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200">
                      <p className="text-xs font-bold text-indigo-700">{dateObj.date}</p>
                      <p className="text-xs text-slate-600 mt-0.5 leading-snug">{dateObj.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-3">No specific dates detected.</p>
              )}
            </div>

            {/* Critical Metrics & Numbers */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <h4 className="text-sm sm:text-base font-bold text-slate-900">Key Numbers & Metrics</h4>
              </div>
              {summaryResult.smartInsights?.importantNumbers?.length ? (
                <div className="space-y-3">
                  {summaryResult.smartInsights.importantNumbers.map((num, idx) => (
                    <div key={idx} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{num.metric}</p>
                        <p className="text-xs text-slate-700 mt-0.5 leading-snug">{num.context}</p>
                      </div>
                      <span className="font-mono font-bold text-sm text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 flex-shrink-0">
                        {num.value}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-3">No quantitative figures detected.</p>
              )}
            </div>
          </div>

          {/* Key Entities & Topics */}
          {summaryResult.smartInsights?.keyEntities?.length ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-slate-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Recognized Entities & Technologies
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {summaryResult.smartInsights.keyEntities.map((ent, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 rounded-xl text-xs font-medium border border-slate-200"
                  >
                    <span>{ent.name}</span>
                    <span className="text-[10px] text-slate-500">({ent.type})</span>
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* TAB CONTENT 3: ASK THIS DOCUMENT (GROUNDED Q&A) */}
      {activeTab === 'qa' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">Ask This Document</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Answers are strictly grounded in your uploaded document with verified source citations.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-200/70 hidden sm:inline">
              Factual Grounding Active
            </span>
          </div>

          {/* Suggested Quick Questions */}
          {summaryResult.suggestedQuestions && summaryResult.suggestedQuestions.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                💡 Suggested Questions for this Document:
              </p>
              <div className="flex flex-wrap gap-2">
                {summaryResult.suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAsking}
                    onClick={() => handleAskQuestion(q)}
                    className="text-left text-xs bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-800 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-purple-200 transition-all font-medium disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Conversation Stream */}
          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            {qaMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed relative group ${
                    msg.role === 'user'
                      ? 'bg-slate-900 text-white rounded-br-none shadow-xs'
                      : 'bg-slate-50/90 text-slate-800 border border-slate-200/90 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>

                  {/* Cited Sources / Excerpts */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-1.5">
                      <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1 uppercase tracking-wider">
                        <Quote className="w-3 h-3 text-purple-600" />
                        Grounded Sources from Document:
                      </p>
                      {msg.sources.map((src, sIdx) => (
                        <blockquote
                          key={sIdx}
                          className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200 italic leading-snug"
                        >
                          "{src}"
                        </blockquote>
                      ))}
                    </div>
                  )}

                  {msg.role === 'assistant' && msg.id !== 'welcome-msg' && (
                    <div className="mt-2 pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleCopyAnswer(msg.id, msg.content)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800"
                      >
                        {copiedAnswerId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Answer</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {isAsking && (
              <div className="flex items-center gap-2 text-xs text-purple-700 bg-purple-50 p-3 rounded-2xl border border-purple-100 max-w-xs">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                <span>Searching document & verifying citations...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskQuestion();
            }}
            className="flex items-center gap-2 pt-2 border-t border-slate-100"
          >
            <input
              type="text"
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              placeholder="Ask any specific question about this document..."
              disabled={isAsking}
              className="flex-1 bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
            <button
              type="submit"
              disabled={!questionInput.trim() || isAsking}
              className="p-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-xs flex-shrink-0"
              title="Send question"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* TAB CONTENT 4: DOCUMENT TEXT INSPECTOR */}
      {activeTab === 'text' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Extracted Raw Text</h3>
              <p className="text-xs text-slate-500">
                {metadata?.wordCount || 0} words • {metadata?.characterCount || 0} characters • {metadata?.paragraphCount || 1} paragraphs • Method:{' '}
                <span className="font-semibold text-slate-800">{metadata?.extractionMethod || 'text'}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(extractedText);
                  setCopiedText(true);
                  setTimeout(() => setCopiedText(false), 2000);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all shadow-2xs"
              >
                {copiedText ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Raw Text</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Search within document */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search words or phrases inside extracted text..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Text Display with Search Highlight */}
          <div className="max-h-96 overflow-y-auto bg-slate-950 text-slate-100 p-5 rounded-2xl font-mono text-xs leading-relaxed whitespace-pre-wrap select-text border border-slate-800">
            {searchTerm.trim() ? (
              extractedText.split(new RegExp(`(${searchTerm.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi')).map((part, i) =>
                part.toLowerCase() === searchTerm.toLowerCase() ? (
                  <mark key={i} className="bg-amber-400 text-slate-950 font-bold px-1 rounded-xs">
                    {part}
                  </mark>
                ) : (
                  part
                )
              )
            ) : (
              extractedText
            )}
          </div>
        </div>
      )}
    </div>
  );
}
