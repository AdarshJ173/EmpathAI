// Export all NLP modules
export * from './posTagging';
export * from './keywordExtraction';
export * from './sentimentAnalysis';
export * from './emotionDetection';
export * from './namedEntityRecognition';
export * from './utils';

// Types for NLP results
export interface AnnotatedText {
  text: string;
  type: string | null;
  color: string | null;
}

// Re-export types for easier usage
export type { POSResult } from './posTagging';
export type { KeywordResult } from './keywordExtraction';
export type { SentimentResult } from './sentimentAnalysis';
export type { EmotionResult } from './emotionDetection';
export type { NERResult, Entity } from './namedEntityRecognition'; 