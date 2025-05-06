import nlp from 'compromise';
import { createAnnotations } from './utils';

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

/**
 * Named Entity Recognition implementation for Next.js
 * Uses Compromise NLP library
 */
export class NamedEntityRecognition {
  private entityColorMap: Record<string, string>;
  
  constructor() {
    // Define colors for different entity types
    this.entityColorMap = {
      'Person': '#FFC107',      // Yellow
      'Place': '#4CAF50',       // Green
      'Organization': '#2196F3', // Blue
      'Date': '#9C27B0',        // Purple
      'Money': '#FF5722',       // Deep Orange
      'Percent': '#607D8B',     // Blue Grey
      'Unit': '#795548',        // Brown
      'Email': '#00BCD4',       // Cyan
      'PhoneNumber': '#E91E63', // Pink
      'URL': '#3F51B5',         // Indigo
      'Quotation': '#FF9800'    // Orange
    };
  }

  /**
   * Perform named entity recognition on text
   * @param text Input text to analyze
   * @returns Recognized entities and annotations
   */
  async classify(text: string): Promise<NERResult> {
    // Use compromise to identify entities
    const doc = nlp(text);
    
    // Extract different types of entities
    const entities: Entity[] = [
      ...this.extractEntities(doc, 'Person', '#Person+'),
      ...this.extractEntities(doc, 'Place', '#Place+'),
      ...this.extractEntities(doc, 'Organization', '#Organization+'),
      ...this.extractEntities(doc, 'Date', '#Date+'),
      ...this.extractEntities(doc, 'Money', '#Money+'),
      ...this.extractEntities(doc, 'Percent', '#Percent+'),
      ...this.extractEntities(doc, 'Unit', '#Unit+'),
      ...this.extractEntities(doc, 'Email', '#Email+'),
      ...this.extractEntities(doc, 'PhoneNumber', '#PhoneNumber+'),
      ...this.extractEntities(doc, 'URL', '#Url+'),
      ...this.extractEntities(doc, 'Quotation', '#Quotation+')
    ];
    
    // Create annotations for highlighting
    const annotations = createAnnotations(text, entities, this.entityColorMap);
    
    return {
      entities,
      annotations
    };
  }

  /**
   * Extract entities of a specific type using a Compromise match pattern
   * @param doc Compromise document
   * @param entityType Type of entity
   * @param matchPattern Pattern to match entities
   * @returns Array of entities
   */
  private extractEntities(doc: any, entityType: string, matchPattern: string): Entity[] {
    const entities: Entity[] = [];
    const matches = doc.match(matchPattern);
    
    if (matches.found) {
      matches.forEach((match: any) => {
        const text = match.text();
        
        // Find the position of this match in the original text
        const offset = this.findOffset(doc, match);
        
        if (offset !== -1) {
          entities.push({
            text,
            type: entityType,
            start: offset,
            end: offset + text.length
          });
        }
      });
    }
    
    return entities;
  }

  /**
   * Find the offset/position of a matched term in the original text
   * This is a simplified approach that may need refinement
   * @param doc Full document
   * @param match Matched term
   * @returns Start offset of match
   */
  private findOffset(doc: any, match: any): number {
    const fullText = doc.text();
    const matchText = match.text();
    let currentOffset = 0;
    
    // Try to find unique matches
    while (currentOffset < fullText.length) {
      const pos = fullText.indexOf(matchText, currentOffset);
      if (pos === -1) break;
      
      // Verify this is the right match by checking surrounding context
      // This is a simplified approach and might need improvements for complex cases
      return pos;
    }
    
    return -1;
  }

  /**
   * Generate text annotations for highlighting entities
   * @param text Input text
   * @param preds Entity predictions
   * @returns Annotations for highlighting
   */
  private getAnnotation(preds: Entity[], text: string): { text: string, type: string | null, color: string | null }[] {
    return createAnnotations(text, preds, this.entityColorMap);
  }
} 