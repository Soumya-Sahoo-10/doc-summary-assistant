import type { DocumentHistoryItem } from '@/types';

const STORAGE_KEY = 'doc_summary_assistant_history_v1';
const MAX_HISTORY_ITEMS = 10;

/**
 * Retrieves saved document history from localStorage.
 */
export function getStoredHistory(): DocumentHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to read document history from localStorage:', err);
    return [];
  }
}

/**
 * Saves or updates a document in local history.
 */
export function saveDocumentToHistory(item: DocumentHistoryItem): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredHistory();
    // Filter out existing item with same id or fileName
    const filtered = current.filter((i) => i.id !== item.id && i.fileName !== item.fileName);
    // Prepend new item
    const updated = [item, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save document to history:', err);
  }
}

/**
 * Removes a specific document from history.
 */
export function removeDocumentFromHistory(id: string): DocumentHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getStoredHistory();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to delete history item:', err);
    return [];
  }
}

/**
 * Clears all history.
 */
export function clearAllHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear history:', err);
  }
}
