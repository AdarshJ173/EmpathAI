import nlp from 'compromise';
import { mergeOverlappingAnnotations, extractKeywordsBasic } from './utils';

export interface KeywordResult {
  keywords: string[];
  annotations: {
    text: string;
    type: string | null;
    color: string | null;
  }[];
}

/**
 * Keyword Extraction implementation for Next.js
 * Using Compromise and custom algorithms to extract keywords from text
 */
export class KeywordExtractor {
  constructor() {}

  /**
   * Extract keywords from text
   * @param text Input text to analyze
   * @param maxKeywords Maximum number of keywords to extract
   * @returns Keywords and text with annotations
   */
  async generate(text: string, maxKeywords: number = 5): Promise<KeywordResult> {
    // Get keywords using multiple methods and combine them
    const keywords = await this.getKeywords(text, maxKeywords);
    
    if (!keywords.length) {
      return {
        keywords: [],
        annotations: [{ text, type: null, color: null }]
      };
    }
    
    // Find all keyword occurrences in the text
    const keywordIndices = this.getKeywordIndices(keywords, text);
    
    // Merge overlapping keyword occurrences
    const mergedIndices = this.mergeUntilFinished(keywordIndices);
    
    // Create annotations for highlighting keywords in text
    const annotations = this.createAnnotation(text, mergedIndices);
    
    return {
      keywords,
      annotations
    };
  }

  /**
   * Extract keywords using multiple methods
   * @param text Input text
   * @param maxKeywords Maximum number of keywords
   * @returns List of keywords
   */
  private async getKeywords(text: string, maxKeywords: number): Promise<string[]> {
    // Use compromise to extract potential keywords
    const doc = nlp(text);
    
    // Extract nouns and noun phrases
    const nouns = doc.match('#Noun+').out('array');
    
    // Extract entities (people, places, organizations)
    const entities = doc.match('#Person+ | #Place+ | #Organization+').out('array');
    
    // Extract adjective + noun combinations
    const adjectiveNouns = doc.match('#Adjective #Noun+').out('array');
    
    // Combine all potential keywords
    let allKeywords = [...nouns, ...entities, ...adjectiveNouns];
    
    // Filter out duplicates and short keywords
    allKeywords = allKeywords
      .filter(k => k.length > 3) // Skip very short keywords
      .filter((k, i, arr) => arr.indexOf(k) === i) // Remove duplicates
      
    // Fall back to basic extraction if needed
    if (allKeywords.length < maxKeywords) {
      const basicKeywords = extractKeywordsBasic(text, maxKeywords);
      allKeywords = [...allKeywords, ...basicKeywords].filter((k, i, arr) => arr.indexOf(k) === i);
    }
    
    // Sort by length (prefer longer keywords which are often more specific)
    allKeywords.sort((a, b) => b.length - a.length);
    
    // Return up to maxKeywords
    return allKeywords.slice(0, maxKeywords);
  }

  /**
   * Find all occurrences of keywords in text
   * @param keywords List of keywords
   * @param text Input text
   * @returns Array of [start, end] index pairs
   */
  private getKeywordIndices(keywords: string[], text: string): number[][] {
    let keywordIndices: number[][] = [];
    const lowerText = text.toLowerCase();
    
    for (const keyword of keywords) {
      const lowerKeyword = keyword.toLowerCase();
      let startPos = 0;
      
      // Find all occurrences of this keyword
      while (startPos < lowerText.length) {
        const pos = lowerText.indexOf(lowerKeyword, startPos);
        if (pos === -1) break;
        
        // Ensure it's a whole word (not part of another word)
        const prevChar = pos > 0 ? lowerText[pos - 1] : ' ';
        const nextChar = pos + lowerKeyword.length < lowerText.length ? 
                         lowerText[pos + lowerKeyword.length] : ' ';
                         
        if (!/[a-z0-9]/i.test(prevChar) && !/[a-z0-9]/i.test(nextChar)) {
          keywordIndices.push([pos, pos + lowerKeyword.length]);
        }
        
        startPos = pos + 1;
      }
    }
    
    return keywordIndices;
  }

  /**
   * Merge overlapping keyword indices until no more can be merged
   * @param indices List of [start, end] index pairs
   * @returns Merged indices
   */
  private mergeUntilFinished(indices: number[][]): number[][] {
    const indicesObj = indices.map(([start, end]) => ({ start, end, type: 'KEY' }));
    return mergeOverlappingAnnotations(indicesObj).map(({start, end}) => [start, end]);
  }

  /**
   * Create text annotations for highlighting
   * @param text Input text
   * @param keywordIndices Keyword index positions
   * @returns Array of text annotations
   */
  private createAnnotation(text: string, keywordIndices: number[][]): { text: string, type: string | null, color: string | null }[] {
    if (!keywordIndices.length) {
      return [{ text, type: null, color: null }];
    }
    
    const annotations = [];
    let lastEnd = 0;
    
    // Sort indices by start position
    const sortedIndices = [...keywordIndices].sort((a, b) => a[0] - b[0]);
    
    for (const [start, end] of sortedIndices) {
      // Add non-keyword text before this keyword
      if (start > lastEnd) {
        annotations.push({
          text: text.substring(lastEnd, start),
          type: null,
          color: null
        });
      }
      
      // Add the keyword with highlighting
      annotations.push({
        text: text.substring(start, end),
        type: 'KEY',
        color: '#26aaef'
      });
      
      lastEnd = end;
    }
    
    // Add any remaining text after the last keyword
    if (lastEnd < text.length) {
      annotations.push({
        text: text.substring(lastEnd),
        type: null,
        color: null
      });
    }
    
    return annotations;
  }
} 