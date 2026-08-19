export type SummaryLength = 'short' | 'medium' | 'long';

export type ExtractionMethod = 'pdf-native' | 'ocr-image' | 'ocr-scanned-pdf';

export type ProcessingStage = 
  | 'idle' 
  | 'uploading' 
  | 'extracting' 
  | 'analyzing' 
  | 'summarizing' 
  | 'completed' 
  | 'error';

export interface DocumentMetadata {
  fileName: string;
  fileSize: number;
  fileType: string;
  pageCount?: number;
  wordCount: number;
  characterCount: number;
  extractionMethod: ExtractionMethod;
  processedAt: string;
}

export interface SummaryResult {
  summary: string;
  keyPoints: string[];
  mainIdeas: string[];
  improvementSuggestions?: string[];
  estimatedReadTimeMinutes: number;
  requestedLength: SummaryLength;
  modelUsed: string;
}

export interface ProcessDocumentResponse {
  success: boolean;
  metadata?: DocumentMetadata;
  extractedText?: string;
  summaryResult?: SummaryResult;
  error?: string;
  errorCode?: string;
}

export interface SummarizeTextRequest {
  text: string;
  length: SummaryLength;
  fileName?: string;
}
