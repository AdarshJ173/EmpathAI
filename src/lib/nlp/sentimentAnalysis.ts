import nlp from 'compromise';
import { calculateBasicSentiment } from './utils';

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

/**
 * Enhanced Sentiment Analysis implementation for Next.js
 * Uses a context-aware rule-based approach with Compromise NLP
 */
export class SentimentAnalysis {
  // Enhanced lexicons for sentiment analysis
  private positiveWords: Set<string>;
  private negativeWords: Set<string>;
  private intensifiers: Map<string, number>;
  private negations: Set<string>;
  private contrastConjunctions: Set<string>;
  
  constructor() {
    // Initialize enhanced sentiment lexicons
    this.positiveWords = new Set([
      'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
      'terrific', 'outstanding', 'superb', 'impressive', 'lovely', 'beautiful',
      'happy', 'delighted', 'pleased', 'glad', 'excited', 'thrilled',
      'enjoy', 'enjoying', 'enjoyed', 'love', 'loving', 'loved',
      'like', 'liking', 'liked', 'appreciate', 'appreciating', 'appreciated',
      'positive', 'optimistic', 'innovative', 'effective', 'efficient',
      'helpful', 'beneficial', 'success', 'successful', 'recommend',
      'satisfied', 'satisfaction', 'perfect', 'perfectly', 'superior',
      'awesome', 'brilliant', 'fabulous', 'incredible', 'marvelous',
      'extraordinary', 'exceptional', 'remarkable', 'splendid', 'spectacular',
      'admirable', 'commendable', 'praiseworthy', 'celebrated', 'acclaimed',
      'acclaimed', 'adored', 'appealing', 'attractive', 'charming', 'delightful',
      'pleasant', 'agreeable', 'favorable', 'gratifying', 'rewarding',
      'satisfying', 'worthwhile', 'valuable', 'precious', 'priceless',
      'cherished', 'treasured', 'welcome', 'refreshing', 'invigorating',
      'inspiring', 'uplifting', 'encouraging', 'reassuring', 'comforting',
      'soothing', 'calming', 'peaceful', 'tranquil', 'serene', 'harmonious',
      'balanced', 'hope', 'hopeful', 'promising', 'bright', 'radiant',
      'fortunate', 'lucky', 'privileged', 'blessed', 'grateful', 'thankful',
      'content', 'jovial', 'joyful', 'cheerful', 'merry', 'elated', 'jubilant',
      'ecstatic', 'exhilarated', 'euphoric', 'triumphant', 'victorious',
      'proud', 'dignified', 'honorable', 'respectable', 'esteemed', 'revered',
      'venerated', 'exalted', 'glorified', 'magnificent', 'majestic', 'grand',
      'sublime', 'elegant', 'graceful', 'fascinating', 'captivating', 'charming'
    ]);
    
    this.negativeWords = new Set([
      'bad', 'terrible', 'awful', 'horrible', 'poor', 'disappointing',
      'disappointed', 'disappoints', 'disappoint', 'useless', 'worthless',
      'unhappy', 'sad', 'angry', 'annoyed', 'annoying', 'annoys',
      'hate', 'hating', 'hated', 'dislike', 'disliking', 'disliked',
      'negative', 'pessimistic', 'ineffective', 'inefficient', 'failure',
      'failed', 'fails', 'problem', 'problematic', 'trouble', 'troubling',
      'suck', 'sucks', 'sucked', 'worst', 'worse', 'horrible', 'atrocious',
      'unfair', 'unpleasant', 'unfortunate', 'unsuccessful', 'unsatisfied',
      'appalling', 'despicable', 'deplorable', 'detestable', 'disgraceful',
      'shameful', 'shameless', 'inexcusable', 'unacceptable', 'inadequate',
      'insufficient', 'substandard', 'mediocre', 'inferior', 'defective',
      'deficient', 'faulty', 'flawed', 'imperfect', 'damaged', 'broken',
      'malfunctioning', 'inoperative', 'unusable', 'unreliable', 'unstable',
      'dangerous', 'harmful', 'destructive', 'detrimental', 'devastating',
      'catastrophic', 'disastrous', 'ruinous', 'calamitous', 'tragic',
      'miserable', 'wretched', 'pathetic', 'pitiful', 'depressing', 'depressed',
      'gloomy', 'dreary', 'bleak', 'somber', 'grave', 'serious', 'severe',
      'grievous', 'distressing', 'disturbing', 'worrying', 'anxious', 'fearful',
      'afraid', 'scared', 'frightened', 'terrified', 'horrified', 'petrified',
      'suspicious', 'distrustful', 'hostile', 'antagonistic', 'aggressive',
      'violent', 'cruel', 'brutal', 'savage', 'vicious', 'malicious', 'spiteful',
      'vengeful', 'vindictive', 'bitter', 'resentful', 'indignant', 'outraged',
      'furious', 'enraged', 'infuriated', 'exasperated', 'irritated', 'annoyed',
      'agitated', 'upset', 'distressed', 'disturbed', 'troubled', 'worried',
      'concerned', 'disappointed', 'dissatisfied', 'displeased', 'disgusted',
      'repulsed', 'revolted', 'sickened', 'nauseated', 'offended', 'insulted',
      'hurt', 'pained', 'suffering', 'agonizing', 'excruciating', 'unbearable',
      'intolerable', 'unendurable', 'difficult', 'hard', 'challenging', 'tough',
      'demanding', 'strenuous', 'arduous', 'laborious', 'burdensome', 'onerous'
    ]);

    // Intensifiers with their multipliers
    this.intensifiers = new Map([
      ['very', 1.5],
      ['extremely', 2.0],
      ['really', 1.5],
      ['so', 1.5],
      ['too', 1.5],
      ['absolutely', 2.0],
      ['completely', 2.0],
      ['totally', 2.0],
      ['utterly', 2.0],
      ['incredibly', 2.0],
      ['exceedingly', 1.8],
      ['particularly', 1.3],
      ['especially', 1.4],
      ['exceptionally', 1.8],
      ['terribly', 1.7],
      ['awfully', 1.6],
      ['super', 1.7],
      ['quite', 1.3],
      ['rather', 1.2],
      ['somewhat', 0.8],
      ['slightly', 0.7],
      ['barely', 0.5],
      ['hardly', 0.5],
      ['a bit', 0.6],
      ['a little', 0.6],
      ['intensely', 1.9],
      ['profoundly', 1.8],
      ['deeply', 1.7],
      ['enormously', 1.8],
      ['immensely', 1.8],
      ['hugely', 1.8],
      ['greatly', 1.6]
    ]);

    // Negation terms
    this.negations = new Set([
      'not', 'no', 'never', 'none', 'nothing', 'nowhere', 'neither', 'nor',
      'hardly', 'rarely', 'scarcely', 'barely', 'seldom', "doesn't", "don't",
      "didn't", "won't", "wouldn't", "couldn't", "can't", 'cannot', "isn't",
      "aren't", "wasn't", "weren't", "hadn't", "hasn't", "haven't", 'without',
      'lacking', 'absence', 'devoid'
    ]);

    // Contrast conjunctions that may reverse sentiment in a sentence
    this.contrastConjunctions = new Set([
      'but', 'however', 'nevertheless', 'nonetheless', 'yet', 'although', 
      'though', 'even though', 'in spite of', 'despite', 'regardless', 
      'notwithstanding', 'on the other hand', 'on the contrary', 'conversely',
      'instead', 'otherwise', 'still', 'except', 'while'
    ]);
  }

  /**
   * Analyze sentiment in text with context awareness
   * @param text Input text to analyze
   * @returns Sentiment prediction scores and annotations
   */
  classify(text: string): SentimentResult {
    if (!text || text.trim() === '') {
      return {
        predictions: { Neutral: 1, Positive: 0, Negative: 0 },
        annotations: [{ text: '', type: null, color: null }]
      };
    }
    
    // Calculate a basic sentiment score between -1 and 1
    const basicScore = calculateBasicSentiment(text);
    
    // Use Compromise to find sentiment-bearing phrases
    const doc = nlp(text);
    
    // Get sentences for more detailed analysis
    const sentences = doc.sentences().out('array');
    
    // Track sentiment scores by sentence
    const sentenceScores: number[] = [];
    const positiveTerms: { text: string, index: number, intensity: number }[] = [];
    const negativeTerms: { text: string, index: number, intensity: number }[] = [];
    
    // Parse each sentence for sentiment
    let globalIndex = 0;
    sentences.forEach((sentence) => {
      const sentenceDoc = nlp(sentence);
      const terms = sentenceDoc.terms().out('array');
      
      // Check for contrast conjunctions
      const hasContrastConjunction = this.findContrastConjunction(terms);
      
      // Split sentence at contrast conjunction if present
      let firstHalf: string[] = terms;
      let secondHalf: string[] = [];
      
      if (hasContrastConjunction) {
        const conjunctionIndex = terms.findIndex(term => 
          this.contrastConjunctions.has(term.toLowerCase())
        );
        
        if (conjunctionIndex > -1) {
          firstHalf = terms.slice(0, conjunctionIndex);
          secondHalf = terms.slice(conjunctionIndex + 1);
        }
      }
      
      // Calculate sentiment for both parts of the sentence
      const firstHalfScore = this.analyzeSentencePart(firstHalf, globalIndex, positiveTerms, negativeTerms);
      let secondHalfScore = 0;
      
      if (secondHalf.length > 0) {
        // Calculate the global index for the second half
        const secondHalfGlobalIndex = globalIndex + 
          firstHalf.join(' ').length + 
          1 + // space
          terms[firstHalf.length].length + 
          1; // space
          
        secondHalfScore = this.analyzeSentencePart(secondHalf, secondHalfGlobalIndex, positiveTerms, negativeTerms);
        
        // In a contrast conjunction, the second half typically carries more weight
        sentenceScores.push(secondHalfScore * 1.5);
      } else {
        sentenceScores.push(firstHalfScore);
      }
      
      // Update global index
      globalIndex += sentence.length + 1; // +1 for space/newline
    });
    
    // Calculate final sentiment score
    let finalScore = 0;
    
    if (sentenceScores.length > 0) {
      // Prioritize the last few sentences (recency effect)
      const weightedScores = sentenceScores.map((score, index) => {
        const weight = 1 + (index / sentenceScores.length) * 0.5;
        return score * weight;
      });
      
      // Calculate weighted average
      const totalWeight = weightedScores.reduce((sum, _, index) => sum + (1 + (index / sentenceScores.length) * 0.5), 0);
      finalScore = weightedScores.reduce((sum, score) => sum + score, 0) / totalWeight;
    } else {
      // Fallback to basic score
      finalScore = basicScore;
    }
    
    // Apply custom scoring rules
    finalScore = this.applyCustomScoringRules(text, finalScore);
    
    // Convert score to probabilities
    const predictions = this.scoreToProbabilities(finalScore);
    
    // Generate annotations for highlighting
    const annotations = this.generateAnnotations(text, positiveTerms, negativeTerms);
    
    return {
      predictions,
      annotations
    };
  }

  /**
   * Analyze part of a sentence for sentiment
   */
  private analyzeSentencePart(
    terms: string[], 
    globalIndex: number,
    positiveTerms: { text: string, index: number, intensity: number }[], 
    negativeTerms: { text: string, index: number, intensity: number }[]
  ): number {
    let score = 0;
    let localIndex = globalIndex;
    
    // Find negations
    const negationIndices: number[] = [];
    terms.forEach((term, index) => {
      if (this.negations.has(term.toLowerCase())) {
        negationIndices.push(index);
      }
    });
    
    // Process terms
    terms.forEach((term, index) => {
      const termLower = term.toLowerCase();
      let termScore = 0;
      let intensity = 1.0;
      
      // Check if term is positive or negative
      if (this.positiveWords.has(termLower)) {
        termScore = 1;
        positiveTerms.push({ text: term, index: localIndex, intensity });
      } else if (this.negativeWords.has(termLower)) {
        termScore = -1;
        negativeTerms.push({ text: term, index: localIndex, intensity });
      }
      
      // Apply intensifiers (preceding term modifiers)
      if (index > 0 && this.intensifiers.has(terms[index - 1].toLowerCase())) {
        intensity = this.intensifiers.get(terms[index - 1].toLowerCase()) || 1.0;
        
        if (termScore > 0) {
          positiveTerms[positiveTerms.length - 1].intensity = intensity;
        } else if (termScore < 0) {
          negativeTerms[negativeTerms.length - 1].intensity = intensity;
        }
      }
      
      // Apply negation (check if this term is negated)
      const isNegated = negationIndices.some(negIndex => 
        negIndex < index && index - negIndex <= 3
      );
      
      if (isNegated) {
        // Negation reverses sentiment but with reduced intensity
        termScore = -termScore * 0.8;
        
        // Update the terms arrays
        if (termScore > 0) {
          // Term was negative, now positive due to negation
          negativeTerms.pop();
          positiveTerms.push({ 
            text: `not ${term}`, 
            index: localIndex - 4, // approximate position of "not"
            intensity: 0.8 
          });
        } else if (termScore < 0) {
          // Term was positive, now negative due to negation
          positiveTerms.pop();
          negativeTerms.push({ 
            text: `not ${term}`, 
            index: localIndex - 4, // approximate position of "not"
            intensity: 0.8 
          });
        }
      }
      
      // Apply intensity to score
      score += termScore * intensity;
      
      // Move to next term position
      localIndex += term.length + 1; // +1 for space
    });
    
    // Normalize score between -1 and 1
    const maxPossibleScore = terms.length; // if every term was positive/negative
    return score / Math.max(1, maxPossibleScore);
  }
  
  /**
   * Check if sentence contains a contrast conjunction
   */
  private findContrastConjunction(terms: string[]): boolean {
    return terms.some(term => this.contrastConjunctions.has(term.toLowerCase()));
  }
  
  /**
   * Apply additional sentiment rules based on text patterns
   */
  private applyCustomScoringRules(text: string, score: number): number {
    let adjustedScore = score;
    
    // Check for ALL CAPS (often indicates stronger sentiment)
    const words = text.split(/\s+/);
    const capsWordCount = words.filter(word => word.length > 1 && word === word.toUpperCase()).length;
    
    if (capsWordCount > 1 || (capsWordCount / words.length > 0.3)) {
      // Amplify the existing sentiment
      adjustedScore = adjustedScore * 1.5;
    }
    
    // Check for exclamation marks (intensifiers)
    const exclamationCount = (text.match(/!/g) || []).length;
    if (exclamationCount > 0) {
      const intensityFactor = Math.min(exclamationCount * 0.2 + 1, 2.0);
      adjustedScore = adjustedScore * intensityFactor;
    }
    
    // Check for question marks (can moderate sentiment)
    const questionCount = (text.match(/\?/g) || []).length;
    if (questionCount > 0 && Math.abs(adjustedScore) > 0.3) {
      // Questions tend to moderate strong sentiment
      adjustedScore = adjustedScore * (1 - (questionCount * 0.1));
    }
    
    // Check for emoticons
    const positiveEmoticons = /[:;]-?[)D]/g;
    const negativeEmoticons = /[:;]-?[\(\[]/g;
    
    const positiveEmoCount = (text.match(positiveEmoticons) || []).length;
    const negativeEmoCount = (text.match(negativeEmoticons) || []).length;
    
    adjustedScore += positiveEmoCount * 0.3;
    adjustedScore -= negativeEmoCount * 0.3;
    
    // Clamp score between -1 and 1
    return Math.max(-1, Math.min(1, adjustedScore));
  }

  /**
   * Run sentiment analysis and justify the results
   * @param text Input text to analyze
   * @returns Sentiment prediction scores and annotations
   */
  run(text: string): SentimentResult {
    return this.classify(text);
  }

  /**
   * Convert sentiment score to probability distribution
   * @param score Sentiment score between -1 and 1
   * @returns Probability distribution across sentiment classes
   */
  private scoreToProbabilities(score: number): { Negative: number; Neutral: number; Positive: number } {
    // Define base neutral probability (minimum neutral value)
    const neutralBase = 0.15;
    
    // Calculate positive and negative probabilities
    let positive = 0;
    let negative = 0;
    
    if (score > 0) {
      positive = score * (1 - neutralBase);
      negative = 0;
    } else if (score < 0) {
      positive = 0;
      negative = -score * (1 - neutralBase);
    }
    
    // Calculate neutral probability
    const neutral = 1 - positive - negative;
    
    // For very weak sentiment (close to 0), increase neutral probability
    const adjustedNeutral = Math.abs(score) < 0.1 
      ? neutral + (0.1 - Math.abs(score)) * 0.5 
      : neutral;
      
    // Recalculate positive and negative to ensure total is 1.0
    const normalizer = 1 / (adjustedNeutral + positive + negative);
    
    return {
      Negative: parseFloat((negative * normalizer).toFixed(3)),
      Neutral: parseFloat((adjustedNeutral * normalizer).toFixed(3)),
      Positive: parseFloat((positive * normalizer).toFixed(3))
    };
  }

  /**
   * Generate text annotations for highlighting sentiment words
   * @param text Input text
   * @param positiveTerms Positive terms with positions
   * @param negativeTerms Negative terms with positions
   * @returns Text annotations for highlighting
   */
  private generateAnnotations(
    text: string,
    positiveTerms: { text: string, index: number, intensity: number }[],
    negativeTerms: { text: string, index: number, intensity: number }[]
  ): { text: string, type: string | null, color: string | null }[] {
    // If no sentiment terms, return the whole text without annotations
    if (positiveTerms.length === 0 && negativeTerms.length === 0) {
      return [{ text, type: null, color: null }];
    }
    
    // Combine all terms and sort by position
    const allTerms = [
      ...positiveTerms.map(term => ({ 
        ...term, 
        type: 'Positive', 
        // Vary color intensity based on sentiment intensity
        color: this.getPositiveColor(term.intensity) 
      })),
      ...negativeTerms.map(term => ({ 
        ...term, 
        type: 'Negative', 
        // Vary color intensity based on sentiment intensity
        color: this.getNegativeColor(term.intensity)
      }))
    ].sort((a, b) => a.index - b.index);
    
    // Build annotations
    const annotations = [];
    let lastIndex = 0;
    
    // Find text regions in the original text for each term
    for (const term of allTerms) {
      const startIdx = text.indexOf(term.text, lastIndex);
      if (startIdx === -1) continue;
      
      const endIdx = startIdx + term.text.length;
      
      // Add text before this term
      if (startIdx > lastIndex) {
        annotations.push({
          text: text.substring(lastIndex, startIdx),
          type: null,
          color: null
        });
      }
      
      // Add the term with highlighting
      annotations.push({
        text: term.text,
        type: term.type,
        color: term.color
      });
      
      lastIndex = endIdx;
    }
    
    // Add text after the last term
    if (lastIndex < text.length) {
      annotations.push({
        text: text.substring(lastIndex),
        type: null,
        color: null
      });
    }
    
    return annotations;
  }
  
  /**
   * Get color for positive sentiment with varying intensity
   */
  private getPositiveColor(intensity: number): string {
    // Use different shades of green based on intensity
    if (intensity >= 1.8) return '#00C853'; // Strong positive
    if (intensity >= 1.4) return '#4CAF50'; // Medium positive
    return '#8BC34A'; // Light positive
  }
  
  /**
   * Get color for negative sentiment with varying intensity
   */
  private getNegativeColor(intensity: number): string {
    // Use different shades of red based on intensity
    if (intensity >= 1.8) return '#D50000'; // Strong negative
    if (intensity >= 1.4) return '#F44336'; // Medium negative
    return '#FF7043'; // Light negative
  }
} 