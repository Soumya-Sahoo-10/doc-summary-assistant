'use client';

import React, { useState } from 'react';
import FileUploadZone from '@/components/FileUploadZone';
import ProcessingStatus from '@/components/ProcessingStatus';
import SummaryResultView from '@/components/SummaryResultView';
import ExtractedTextViewer from '@/components/ExtractedTextViewer';
import type { DocumentMetadata, ProcessDocumentResponse, ProcessingStage, SummaryLength, SummaryResult } from '@/types';

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

  const handleProcess = async () => {
    if (!file) return;

    setStage('uploading');
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('length', summaryLength);

    try {
      // Step simulation for pleasant visual progression
      setTimeout(() => {
        setStage((curr) => (curr === 'uploading' ? 'extracting' : curr));
      }, 700);

      setTimeout(() => {
        setStage((curr) => (curr === 'extracting' ? 'analyzing' : curr));
      }, 1800);

      setTimeout(() => {
        setStage((curr) => (curr === 'analyzing' ? 'summarizing' : curr));
      }, 2600);

      const res = await fetch('/api/process-document', {
        method: 'POST',
        body: formData,
      });

      const data: ProcessDocumentResponse = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to process document.');
      }

      setSummaryResult(data.summaryResult || null);
      setMetadata(data.metadata);
      setExtractedText(data.extractedText || '');
      setStage('completed');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'An unexpected error occurred during processing.');
      setStage('error');
    }
  };

  const handleReSummarize = async (newLength: SummaryLength) => {
    if (!extractedText) return;

    setIsReSummarizing(true);
    try {
      const res = await fetch('/api/summarize-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: extractedText, length: newLength }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to re-generate summary.');
      }

      setSummaryResult(data.summaryResult);
      setSummaryLength(newLength);
    } catch (err: any) {
      alert(`Could not re-generate summary: ${err.message || 'Unknown error'}`);
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

  return (
    <div className="space-y-8">
      {/* Upload Zone (Hidden when viewing completed result) */}
      {!summaryResult && (
        <FileUploadZone
          selectedFile={file}
          onFileSelect={setFile}
          summaryLength={summaryLength}
          onLengthChange={setSummaryLength}
          onProcess={handleProcess}
          isProcessing={stage !== 'idle' && stage !== 'completed' && stage !== 'error'}
        />
      )}

      {/* Progress & Status Indicators */}
      <ProcessingStatus stage={stage} error={errorMessage} />

      {/* Results View */}
      {summaryResult && (
        <>
          <SummaryResultView
            summaryResult={summaryResult}
            metadata={metadata}
            extractedText={extractedText}
            onReSummarize={handleReSummarize}
            isReSummarizing={isReSummarizing}
            onReset={handleReset}
          />

          <ExtractedTextViewer extractedText={extractedText} metadata={metadata} />
        </>
      )}
    </div>
  );
}
