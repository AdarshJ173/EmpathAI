// Mock NLP interfaces and types for UI compatibility

// Export mock implementations
export * from './mock';

// Types for NLP results
export interface AnnotatedText {
  text: string;
  type: string | null;
  color: string | null;
}

// Re-export types from mock implementation
export type { POSResult, KeywordResult, SentimentResult, EmotionResult, NERResult, Entity } from './mock';