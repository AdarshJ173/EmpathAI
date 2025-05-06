import nlp from 'compromise';
import type { Document } from 'compromise';

export interface POSResult {
  tokens: {
    text: string;
    tag: string;
  }[];
  annotations: {
    text: string;
    type: string | null;
    color: string | null;
  }[];
}

/**
 * Part of Speech Tagging implementation for Next.js
 * Based on the Compromise NLP library
 */
export class POSTagging {
  private tagColorMap: Record<string, string>;

  constructor() {
    // Define color mapping for different POS tags
    this.tagColorMap = {
      Noun: '#1f77b4',
      Verb: '#ff7f0e',
      Adjective: '#2ca02c',
      Adverb: '#d62728',
      Pronoun: '#9467bd',
      Preposition: '#8c564b',
      Conjunction: '#e377c2',
      Determiner: '#7f7f7f',
      Article: '#bcbd22',
      Interjection: '#17becf',
    };
  }

  /**
   * Perform POS tagging on input text
   * @param text Input text to analyze
   * @returns Tagged tokens and annotations
   */
  classify(text: string): POSResult {
    // Use compromise to analyze text
    const doc: Document = nlp(text);
    
    // Extract tokens with their tags
    const tokens = [];
    let position = 0;
    
    // Process each term in the document
    doc.terms().forEach(term => {
      const text = term.text();
      
      // Map compromise tags to simplified POS tags
      let tag = 'Unknown';
      
      if (term.isNoun()) tag = 'Noun';
      else if (term.isVerb()) tag = 'Verb';
      else if (term.isAdjective()) tag = 'Adjective';
      else if (term.isAdverb()) tag = 'Adverb';
      else if (term.isPronoun()) tag = 'Pronoun';
      else if (term.isPreposition()) tag = 'Preposition';
      else if (term.isConjunction()) tag = 'Conjunction';
      else if (term.isArticle()) tag = 'Article';
      else if (term.isExclamation()) tag = 'Interjection';
      else if (term.isDeterminer()) tag = 'Determiner';
      
      tokens.push({
        text,
        tag
      });
    });
    
    // Generate annotations for highlighting
    const annotations = tokens.map(token => ({
      text: token.text,
      type: token.tag,
      color: this.tagColorMap[token.tag] || '#cccccc'
    }));
    
    return {
      tokens,
      annotations
    };
  }
} 