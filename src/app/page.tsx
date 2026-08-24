'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import LandingHero from '@/components/LandingHero';
import FileUploadZone from '@/components/FileUploadZone';
import ProcessingStatus from '@/components/ProcessingStatus';
import DocumentWorkspace from '@/components/DocumentWorkspace';
import RecentDocumentsModal from '@/components/RecentDocumentsModal';
import {
  getStoredHistory,
  saveDocumentToHistory,
  removeDocumentFromHistory,
  clearAllHistory,
} from '@/lib/historyStorage';
import type { SampleDocument } from '@/lib/sampleDocuments';
import type {
  DocumentHistoryItem,
  DocumentMetadata,
  ProcessDocumentResponse,
  ProcessingStage,
  SummaryLength,
  SummaryTone,
  SummaryResult,
} from '@/types';

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [summaryLength, setSummaryLength] = useState<SummaryLength>('medium');
  const [stage, setStage] = useState<ProcessingStage>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Result state
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);
  const [metadata, setMetadata] = useState<DocumentMetadata | undefined>(undefined);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isReSummarizing, setIsReSummarizing] = useState(false);

  // History state
  const [history, setHistory] = useState<DocumentHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    setHistory(getStoredHistory());
  }, []);

  const handleProcessFile = async () => {
    if (!file) return;

    setStage('uploading');
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('length', summaryLength);

    try {
      setTimeout(() => {
        setStage((curr) => (curr === 'uploading' ? 'extracting' : curr));
      }, 500);

      setTimeout(() => {
        setStage((curr) => (curr === 'extracting' ? 'analyzing' : curr));
      }, 1400);

      setTimeout(() => {
        setStage((curr) => (curr === 'analyzing' ? 'summarizing' : curr));
      }, 2200);

      const res = await fetch('/api/process-document', {
        method: 'POST',
        body: formData,
      });

      const data: ProcessDocumentResponse = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to process document.');
      }

      const result = data.summaryResult || null;
      const meta = data.metadata;
      const text = data.extractedText || '';

      setSummaryResult(result);
      setMetadata(meta);
      setExtractedText(text);
      setStage('completed');

      if (result && meta) {
        const historyItem: DocumentHistoryItem = {
          id: `doc-${Date.now()}`,
          fileName: meta.fileName,
          fileSize: meta.fileSize,
          fileType: meta.fileType,
          extractionMethod: meta.extractionMethod,
          processedAt: meta.processedAt,
          wordCount: meta.wordCount,
          summaryResult: result,
          extractedText: text,
        };
        saveDocumentToHistory(historyItem);
        setHistory(getStoredHistory());
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'An unexpected error occurred during processing.');
      setStage('error');
    }
  };

  const handleSelectSampleDocument = async (sample: SampleDocument) => {
    setStage('uploading');
    setErrorMessage(null);
    setFile(null);

    try {
      setTimeout(() => setStage('extracting'), 300);
      setTimeout(() => setStage('analyzing'), 900);
      setTimeout(() => setStage('summarizing'), 1500);

      const res = await fetch('/api/summarize-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sample.text,
          length: summaryLength,
          tone: 'executive',
          fileName: sample.fileName,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to process sample document.');
      }

      const wordCount = sample.text.split(/\s+/).filter(Boolean).length;
      const meta: DocumentMetadata = {
        fileName: sample.fileName,
        fileSize: sample.fileSize,
        fileType: sample.fileType,
        wordCount,
        characterCount: sample.text.length,
        paragraphCount: sample.text.split(/\n{2,}/).filter((p) => p.trim().length > 0).length,
        extractionMethod: sample.extractionMethod,
        processedAt: new Date().toISOString(),
      };

      setSummaryResult(data.summaryResult);
      setMetadata(meta);
      setExtractedText(sample.text);
      setStage('completed');

      const historyItem: DocumentHistoryItem = {
        id: `sample-${Date.now()}`,
        fileName: sample.fileName,
        fileSize: sample.fileSize,
        fileType: sample.fileType,
        extractionMethod: sample.extractionMethod,
        processedAt: meta.processedAt,
        wordCount,
        summaryResult: data.summaryResult,
        extractedText: sample.text,
      };
      saveDocumentToHistory(historyItem);
      setHistory(getStoredHistory());
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load sample document.');
      setStage('error');
    }
  };

  const handleReSummarize = async (newLength: SummaryLength, newTone: SummaryTone = 'executive') => {
    if (!extractedText) return;

    setIsReSummarizing(true);
    try {
      const res = await fetch('/api/summarize-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: extractedText,
          length: newLength,
          tone: newTone,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to re-generate summary.');
      }

      setSummaryResult(data.summaryResult);
      setSummaryLength(newLength);
    } catch (err: any) {
      alert(`Could not update analysis: ${err.message || 'Unknown error'}`);
    } finally {
      setIsReSummarizing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setStage('idle');
    setErrorMessage(null);
    setSummaryResult(null);
    setMetadata(undefined);
    setExtractedText('');
  };

  const handleRestoreFromHistory = (item: DocumentHistoryItem) => {
    setSummaryResult(item.summaryResult);
    setMetadata({
      fileName: item.fileName,
      fileSize: item.fileSize,
      fileType: item.fileType,
      wordCount: item.wordCount,
      characterCount: item.extractedText.length,
      paragraphCount: item.extractedText.split(/\n{2,}/).filter((p) => p.trim().length > 0).length,
      extractionMethod: item.extractionMethod,
      processedAt: item.processedAt,
    });
    setExtractedText(item.extractedText);
    setStage('completed');
    setIsHistoryOpen(false);
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = removeDocumentFromHistory(id);
    setHistory(updated);
  };

  const handleClearAllHistory = () => {
    clearAllHistory();
    setHistory([]);
  };

  return (
    <div className="space-y-8">
      {/* Dynamic Navigation */}
      <Navbar
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onNewDocument={handleReset}
        isWorkspaceActive={!!summaryResult}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Landing Hero (Shown when no active document) */}
        {!summaryResult && stage === 'idle' && (
          <LandingHero
            onSelectSample={handleSelectSampleDocument}
            disabled={stage !== 'idle'}
          />
        )}

        {/* Upload Zone (Shown when not viewing completed result) */}
        {!summaryResult && (
          <div className="mt-4">
            <FileUploadZone
              selectedFile={file}
              onFileSelect={setFile}
              summaryLength={summaryLength}
              onLengthChange={setSummaryLength}
              onProcess={handleProcessFile}
              isProcessing={stage !== 'idle' && stage !== 'completed' && stage !== 'error'}
            />
          </div>
        )}

        {/* Multi-Stage Processing Pipeline */}
        <ProcessingStatus
          stage={stage}
          error={errorMessage}
          onRetry={file ? handleProcessFile : handleReset}
        />

        {/* Document Intelligence Workspace */}
        {summaryResult && (
          <DocumentWorkspace
            summaryResult={summaryResult}
            metadata={metadata}
            extractedText={extractedText}
            onReSummarize={handleReSummarize}
            isReSummarizing={isReSummarizing}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Recent History Modal */}
      <RecentDocumentsModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectDocument={handleRestoreFromHistory}
        onDeleteDocument={handleDeleteHistoryItem}
        onClearAll={handleClearAllHistory}
      />
    </div>
  );
}
