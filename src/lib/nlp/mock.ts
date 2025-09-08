/**
 * Mock implementations for NLP functionality
 * This file provides simplified mock implementations of the NLP classes
 * to maintain UI compatibility while removing the actual NLP functionality
 */

// Mock interfaces to match the original NLP interfaces
export interface POSResult {
  tokens: {
    text: string;
    tag: string;
  }[];
  tags: string[];
  annotations: {
    text: string;
    type: string | null;
    color: string | null;
  }[];
}

export interface KeywordResult {
  keywords: string[];
  annotations: {
    text: string;
    type: string | null;
    color: string | null;
  }[];
}

export interface SentimentResult {
  predictions: {
    Negative: number;
    Neutral: number;
    Positive: number;
  };
  annotations: {
    text: string;
    type: string | null;
    color: string | null;
  }[];
}

export interface EmotionResult {
  predictions: Record<string, number>;
  annotations: {
    text: string;
    type: string | null;
    color: string | null;
  }[];
}

export interface Entity {
  text: string;
  type: string;
  start: number;
  end: number;
}

export interface NERResult {
  entities: Entity[];
  annotations: {
    text: string;
    type: string | null;
    color: string | null;
  }[];
}

// Mock implementations of NLP classes
export class POSTagging {
  classify(text: string): Promise<POSResult> {
    return Promise.resolve({
      tokens: [],
      tags: [], // Add tags array for compatibility
      annotations: [{ text, type: null, color: null }]
    });
  }
}

export class KeywordExtractor {
  async generate(text: string, maxKeywords: number = 5): Promise<KeywordResult> {
    // Extract some simple keywords from the text
    const words = text.split(/\s+/).filter(word => word.length > 3);
    const uniqueWords = Array.from(new Set(words));
    const keywords = uniqueWords.slice(0, maxKeywords);
    
    return {
      keywords,
      annotations: [{ text, type: null, color: null }]
    };
  }
}

export class SentimentAnalysis {
  classify(text: string): Promise<SentimentResult> {
    return Promise.resolve({
      predictions: {
        Positive: 0.33,
        Neutral: 0.34,
        Negative: 0.33
      },
      annotations: [{ text, type: null, color: null }]
    });
  }
  
  run(text: string): Promise<SentimentResult> {
    return this.classify(text);
  }
}

export class EmotionDetection {
  classify(text: string): Promise<EmotionResult> {
    return Promise.resolve({
      predictions: {
        neutral: 0.5,
        happy: 0.2,
        sad: 0.1,
        angry: 0.1,
        surprised: 0.1
      },
      annotations: [{ text, type: null, color: null }]
    });
  }
  
  run(text: string): Promise<EmotionResult> {
    return this.classify(text);
  }
}

export class NamedEntityRecognition {
  classify(text: string): Promise<NERResult> {
    return Promise.resolve({
      entities: [],
      annotations: [{ text, type: null, color: null }]
    });
  }
}

// Mock utility functions
export function findPrimaryEmotion(predictions: Record<string, number>): string {
  if (!predictions || Object.keys(predictions).length === 0) {
    return 'neutral';
  }
  
  const entries = Object.entries(predictions);
  const sorted = entries.sort((a, b) => b[1] - a[1]);
  return sorted[0][0];
}

export function findPrimarySentiment(predictions: Record<string, number>): string {
  if (!predictions) {
    return 'neutral';
  }
  
  const { Positive = 0, Neutral = 0, Negative = 0 } = predictions;
  
  if (Positive > Neutral && Positive > Negative) {
    return 'positive';
  } else if (Negative > Neutral && Negative > Positive) {
    return 'negative';
  } else {
    return 'neutral';
  }
}

export function calculateConfidence(predictions: Record<string, number>): number {
  if (!predictions || Object.keys(predictions).length === 0) {
    return 1.0;
  }
  
  const values = Object.values(predictions);
  const max = Math.max(...values);
  return max;
}

export function calculateSentimentStrength(predictions: Record<string, number>): number {
  if (!predictions) {
    return 0.5;
  }
  
  const { Positive = 0, Negative = 0 } = predictions;
  return Math.max(Positive, Negative);
}

export function calculateBasicSentiment(text: string): { positive: number, negative: number, neutral: number } {
  return {
    positive: 0.33,
    negative: 0.33,
    neutral: 0.34
  };
}

export function extractKeywordsBasic(text: string, maxKeywords: number = 5): string[] {
  const words = text.split(/\s+/).filter(word => word.length > 3);
  const uniqueWords = Array.from(new Set(words));
  return uniqueWords.slice(0, maxKeywords);
}

export function createAnnotations(text: string, entities: any[], colorMap: Record<string, string> = {}): any[] {
  return [{ text, type: null, color: null }];
}

export function mergeOverlappingAnnotations(annotations: any[]): any[] {
  // This is a simplified version that just returns the annotations as-is
  // The original implementation would merge overlapping annotations
  return annotations;
}