'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File, Image as ImageIcon, X, Sparkles, AlertCircle } from 'lucide-react';
import type { SummaryLength } from '@/types';
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB, validateUploadedFile } from '@/lib/validators';

interface FileUploadZoneProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  summaryLength: SummaryLength;
  onLengthChange: (length: SummaryLength) => void;
  onProcess: () => void;
  isProcessing: boolean;
}

export default function FileUploadZone({
  selectedFile,
  onFileSelect,
  summaryLength,
  onLengthChange,
  onProcess,
  isProcessing,
}: FileUploadZoneProps) {
  const [validationError, setValidationError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      setValidationError(null);

      if (fileRejections.length > 0) {
        const rejection = fileRejections[0];
        if (rejection.file.size > MAX_FILE_SIZE_BYTES) {
          setValidationError(`File is larger than the ${MAX_FILE_SIZE_MB}MB limit.`);
        } else {
          setValidationError('Unsupported file format. Please upload a PDF or image (PNG/JPG).');
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const validation = validateUploadedFile(file);
        if (!validation.valid) {
          setValidationError(validation.error || 'Invalid file.');
          return;
        }
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE_BYTES,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp'],
    },
    disabled: isProcessing,
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const isImage = selectedFile && !selectedFile.name.toLowerCase().endsWith('.pdf');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm transition-all">
      <div className="text-center max-w-xl mx-auto mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Upload Document</h2>
        <p className="text-sm text-slate-500 mt-1">
          Upload any PDF or scanned image document to extract text and generate an intelligent AI summary.
        </p>
      </div>

      {/* Drag & Drop Area */}
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
              : isDragReject
              ? 'border-red-400 bg-red-50/30'
              : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/60'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 shadow-sm">
              <UploadCloud className="w-7 h-7 animate-pulse" />
            </div>
            <p className="text-base font-semibold text-slate-800">
              {isDragActive ? 'Drop your document here...' : 'Drag & drop your document here'}
            </p>
            <p className="text-xs text-slate-500 mt-1">or click to browse from your device</p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center text-[11px] font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                PDF Documents
              </span>
              <span className="inline-flex items-center text-[11px] font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                PNG, JPG, JPEG, WEBP
              </span>
              <span className="inline-flex items-center text-[11px] font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                Up to {MAX_FILE_SIZE_MB}MB
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Selected File Card */
        <div className="border border-indigo-100 bg-indigo-50/40 rounded-xl p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              {isImage ? <ImageIcon className="w-6 h-6" /> : <File className="w-6 h-6" />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{selectedFile.name}</p>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                <span>{formatFileSize(selectedFile.size)}</span>
                <span>•</span>
                <span className="font-medium text-indigo-700">
                  {isImage ? 'Scanned Image (OCR)' : 'PDF Document'}
                </span>
              </div>
            </div>
          </div>

          {!isProcessing && (
            <button
              onClick={() => onFileSelect(null)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-colors"
              title="Remove file"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* Validation Error Alert */}
      {validationError && (
        <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-700 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Summary Length Options */}
      <div className="mt-6 pt-6 border-t border-slate-100">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
          Summary Length Preset
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(
            [
              { id: 'short', label: 'Short', desc: '1-2 paragraphs' },
              { id: 'medium', label: 'Medium', desc: '2-4 paragraphs' },
              { id: 'long', label: 'Long', desc: 'Detailed breakdown' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={isProcessing}
              onClick={() => onLengthChange(item.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                summaryLength === item.id
                  ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-semibold ${
                    summaryLength === item.id ? 'text-indigo-900' : 'text-slate-800'
                  }`}
                >
                  {item.label}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    summaryLength === item.id ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-6">
        <button
          type="button"
          onClick={onProcess}
          disabled={!selectedFile || isProcessing}
          className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${
            !selectedFile || isProcessing
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 shadow-md active:scale-[0.99]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          {isProcessing ? 'Processing Document...' : 'Generate Document Summary'}
        </button>
      </div>
    </div>
  );
}
