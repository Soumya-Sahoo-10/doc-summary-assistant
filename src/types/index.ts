export type SummaryLength = 'short' | 'medium' | 'long';

export type SummaryTone = 'executive' | 'simple' | 'technical' | 'student';

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
  paragraphCount?: number;
  extractionMethod: ExtractionMethod;
  processedAt: string;
}

export interface ActionItem {
  id: string;
  text: string;
  category?: 'Urgent' | 'Follow-up' | 'Review' | 'General';
  completed?: boolean;
}

export interface ImportantDate {
  date: string;
  description: string;
}

export interface ImportantNumber {
  metric: string;
  value: string;
  context: string;
}

export interface KeyEntity {
  name: string;
  type: 'Organization' | 'Person' | 'Technology' | 'Location' | 'Concept';
}

export interface SmartInsights {
  actionItems: ActionItem[];
  importantDates: ImportantDate[];
  importantNumbers: ImportantNumber[];
  keyEntities: KeyEntity[];
}

export interface SummaryResult {
  summary: string;
  keyPoints: string[];
  mainIdeas: string[];
  improvementSuggestions?: string[];
  smartInsights?: SmartInsights;
  suggestedQuestions?: string[];
  estimatedReadTimeMinutes: number;
  requestedLength: SummaryLength;
  requestedTone?: SummaryTone;
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
  tone?: SummaryTone;
  fileName?: string;
}

export interface QAMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  timestamp: string;
}

export interface AskDocumentRequest {
  documentText: string;
  question: string;
  fileName?: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

export interface AskDocumentResponse {
  success: boolean;
  answer?: string;
  sources?: string[];
  suggestedFollowUps?: string[];
  error?: string;
}

export interface DocumentHistoryItem {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  extractionMethod: ExtractionMethod;
  processedAt: string;
  wordCount: number;
  summaryResult: SummaryResult;
  extractedText: string;
}
