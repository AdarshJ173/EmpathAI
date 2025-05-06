import nlp from 'compromise';

export interface EmotionResult {
  predictions: Record<string, number>;
  annotations: {
    text: string;
    type: string | null;
    color: string | null;
  }[];
}

/**
 * Emotion Detection implementation for Next.js
 * Uses an enhanced lexicon-based approach with context handling
 */
export class EmotionDetection {
  private emotionsLexicon: Record<string, string[]>;
  private emotionColors: Record<string, string>;
  private negationTerms: string[];
  private intensifierTerms: Record<string, number>;
  
  constructor() {
    // Expanded emotion lexicons - words associated with different emotions
    this.emotionsLexicon = {
      'joy': [
        'happy', 'happiness', 'joyful', 'joy', 'delighted', 'delightful', 'glad',
        'pleased', 'pleasure', 'cheerful', 'excitement', 'excited', 'thrilled',
        'enjoy', 'enjoying', 'enjoyed', 'laugh', 'laughing', 'laughed', 'fun',
        'celebration', 'celebrate', 'celebrated', 'smile', 'smiling', 'smiled',
        'ecstatic', 'overjoyed', 'jubilant', 'elated', 'content', 'satisfied',
        'playful', 'jolly', 'jubilation', 'glee', 'gleeful', 'merry', 'bliss',
        'blissful', 'triumphant', 'triumph', 'victorious', 'victory', 'win',
        'winning', 'won', 'delight', 'gratified', 'jovial', 'lively', 'pleasant'
      ],
      'sadness': [
        'sad', 'sadness', 'unhappy', 'miserable', 'depressed', 'depression',
        'upset', 'devastated', 'devastation', 'sorrow', 'sorrowful', 'grief',
        'grieving', 'mourn', 'mourning', 'heartbroken', 'heartbreak', 'tearful',
        'crying', 'cried', 'cry', 'weep', 'weeping', 'wept', 'disappointed',
        'disappointing', 'disappointment', 'discouraged', 'disheartened', 'despondent',
        'dejected', 'melancholy', 'gloomy', 'dismal', 'somber', 'forlorn',
        'hopeless', 'downcast', 'downhearted', 'low', 'down', 'blue', 'lonely',
        'loneliness', 'regret', 'regretful', 'remorse', 'remorseful', 'despair'
      ],
      'anger': [
        'angry', 'anger', 'furious', 'fury', 'rage', 'enraged', 'mad', 'annoyed',
        'annoying', 'irritated', 'irritating', 'aggravated', 'frustrated',
        'frustration', 'hate', 'hatred', 'hostile', 'hostility', 'disgusted',
        'disgust', 'outraged', 'outrage', 'bitter', 'resentful', 'resentment',
        'irate', 'livid', 'incensed', 'indignant', 'provoked', 'infuriated',
        'exasperated', 'displeased', 'cross', 'seething', 'vexed', 'irritable',
        'antagonized', 'offended', 'fuming', 'agitated', 'outburst', 'irked',
        'pissed', 'inflamed', 'angered', 'upset', 'huff', 'tantrum', 'wrath'
      ],
      'fear': [
        'afraid', 'fear', 'fearful', 'scared', 'frightened', 'terrified',
        'terror', 'panic', 'panicking', 'panicked', 'anxiety', 'anxious', 'worried',
        'worry', 'worrying', 'concerned', 'dread', 'dreading', 'dreaded', 'horror',
        'horrified', 'alarmed', 'alarm', 'threatened', 'threatening',
        'timid', 'apprehensive', 'nervous', 'distress', 'distressed', 'paranoid',
        'suspicious', 'uneasy', 'uncomfortable', 'phobia', 'intimidated',
        'insecure', 'doubtful', 'helpless', 'vulnerable', 'danger', 'dangerous',
        'jittery', 'jumpy', 'startled', 'fright', 'petrified', 'horrific', 'chill'
      ],
      'surprise': [
        'surprised', 'surprise', 'shocking', 'shocked', 'astonished', 'astonishment',
        'amazed', 'amazing', 'stunned', 'unexpected', 'startled', 'startling',
        'sudden', 'suddenly', 'unforeseen', 'wonder', 'wondering', 'wondered',
        'astounding', 'astounded', 'remarkable', 'speechless', 'extraordinary',
        'awestruck', 'dumbfounded', 'bewildered', 'puzzled', 'perplexed',
        'taken aback', 'blown away', 'staggered', 'overwhelmed', 'unexpected',
        'unprepared', 'flabbergasted', 'amazement', 'unbelievable', 'incredible',
        'jaw-dropping', 'eye-opening', 'revelation', 'bolt', 'bombshell', 'shock'
      ],
      'optimism': [
        'optimistic', 'optimism', 'hopeful', 'hope', 'positive', 'confident',
        'confidence', 'enthusiastic', 'enthusiasm', 'eager', 'excited', 'encouraging',
        'encouraged', 'promising', 'bright', 'opportunity', 'opportunities',
        'potential', 'success', 'successful', 'inspiration', 'inspired',
        'favorable', 'fortunate', 'reassuring', 'reassured', 'motivated', 'motivation',
        'expectant', 'aspiration', 'aspire', 'upbeat', 'buoyant', 'sanguine',
        'cheerful', 'rosy', 'uplifting', 'reassurance', 'ambitious', 'ambition',
        'good', 'better', 'best', 'wonderful', 'splendid', 'favorable', 'desirable'
      ],
      'love': [
        'love', 'loving', 'loved', 'adore', 'adoring', 'adored', 'affection',
        'affectionate', 'fond', 'fondness', 'care', 'caring', 'cared', 'cherish',
        'cherished', 'cherishing', 'devoted', 'devotion', 'romance', 'romantic',
        'admire', 'admiration', 'admired', 'tenderness', 'tender',
        'enamored', 'smitten', 'passionate', 'passion', 'adoration', 'compassion',
        'compassionate', 'warmth', 'warm', 'attachment', 'attracted', 'attraction',
        'enchanted', 'captivated', 'infatuated', 'treasure', 'treasured', 'intimate',
        'intimacy', 'connected', 'connection', 'amorous', 'dear', 'sweetheart'
      ],
      'confusion': [
        'confused', 'confusing', 'confusion', 'puzzled', 'puzzling', 'perplexed',
        'perplexing', 'baffled', 'baffling', 'bewildered', 'bewildering', 'disoriented',
        'disorientated', 'disorientation', 'unclear', 'uncertain', 'unsure',
        'ambiguous', 'ambiguity', 'vague', 'vagueness', 'muddled', 'cloudy',
        'lost', 'struggling', 'misunderstand', 'misunderstanding', 'paradox',
        'paradoxical', 'contradictory', 'incoherent', 'mixed up', 'disarray'
      ],
      'gratitude': [
        'grateful', 'gratitude', 'thankful', 'thankfulness', 'appreciate', 
        'appreciative', 'appreciation', 'indebted', 'obliged', 'overwhelmed', 
        'touched', 'moved', 'blessing', 'blessed', 'honored', 'praise',
        'thank', 'thanking', 'thanked', 'regards', 'regard', 'recognized',
        'recognition', 'acknowledged', 'acknowledged', 'acknowledged'
      ],
      'neutral': [
        'neutral', 'indifferent', 'impartial', 'unbiased', 'objective', 'detached',
        'dispassionate', 'uninvolved', 'noncommittal', 'reserved', 'moderate',
        'ambivalent', 'undecided', 'undetermined', 'impassive', 'disinterested',
        'equidistant', 'middle', 'centered', 'balanced', 'unexcited', 'unexcitable',
        'unimpressed', 'unmoved', 'neither', 'nor', 'middling', 'lukewarm'
      ]
    };
    
    // Colors for emotion highlighting
    this.emotionColors = {
      'joy': '#FFC107',
      'sadness': '#2196F3',
      'anger': '#F44336',
      'fear': '#9C27B0',
      'surprise': '#00BCD4',
      'optimism': '#4CAF50',
      'love': '#E91E63',
      'confusion': '#FF9800',
      'gratitude': '#8BC34A',
      'neutral': '#9E9E9E'
    };
    
    // Negation terms that can reverse emotion meaning
    this.negationTerms = [
      'not', 'no', 'never', 'none', 'nothing', 'nowhere', 'neither', 'nor',
      'hardly', 'rarely', 'scarcely', 'barely', 'seldom', 'doesn\'t', 'don\'t',
      'didn\'t', 'won\'t', 'wouldn\'t', 'couldn\'t', 'can\'t', 'cannot', 'isn\'t',
      'aren\'t', 'wasn\'t', 'weren\'t', 'hadn\'t', 'hasn\'t', 'haven\'t', 'without',
      'lacking', 'absence', 'devoid'
    ];
    
    // Intensifier terms with strength modifiers
    this.intensifierTerms = {
      'very': 1.5,
      'extremely': 2.0,
      'really': 1.5,
      'so': 1.5,
      'too': 1.5,
      'absolutely': 2.0,
      'completely': 2.0,
      'totally': 2.0,
      'utterly': 2.0,
      'incredibly': 2.0,
      'exceedingly': 1.8,
      'particularly': 1.3,
      'especially': 1.4,
      'exceptionally': 1.8,
      'terribly': 1.7,
      'awfully': 1.6,
      'super': 1.7,
      'quite': 1.3,
      'rather': 1.2,
      'somewhat': 0.8,
      'slightly': 0.7,
      'barely': 0.5,
      'hardly': 0.5,
      'a bit': 0.6,
      'a little': 0.6,
      'intensely': 1.9,
      'profoundly': 1.8,
      'deeply': 1.7,
      'enormously': 1.8,
      'immensely': 1.8,
      'hugely': 1.8,
      'greatly': 1.6
    };
  }

  /**
   * Detect emotions in text with context handling
   * @param text Input text to analyze
   * @returns Emotion prediction scores and annotations
   */
  classify(text: string): EmotionResult {
    if (!text || text.trim() === '') {
      return {
        predictions: { 'neutral': 1.0 },
        annotations: [{ text: '', type: null, color: null }]
      };
    }
    
    // Use Compromise to analyze the text
    const doc = nlp(text);
    
    // Initialize context and counts
    const emotionCounts: Record<string, number> = {};
    const emotionTerms: Record<string, { text: string, index: number, context: number }[]> = {};
    
    // Initialize counts and term arrays for each emotion
    Object.keys(this.emotionsLexicon).forEach(emotion => {
      emotionCounts[emotion] = 0;
      emotionTerms[emotion] = [];
    });
    
    // Get sentences for context analysis
    const sentences = doc.sentences().out('array');
    
    // First pass: find emotion words and their contexts
    sentences.forEach((sentence, sentenceIdx) => {
      const sentenceDoc = nlp(sentence);
      let wordIndex = 0;
      
      // Find negations in this sentence
      const negations = this.findNegationTerms(sentenceDoc);
      
      // Find intensifiers in this sentence  
      const intensifiers = this.findIntensifierTerms(sentenceDoc);
      
      // Process each term in the sentence
      sentenceDoc.terms().forEach(term => {
        const word = term.text().toLowerCase();
        const currentIndex = wordIndex;
        
        // Check word against each emotion lexicon
        Object.entries(this.emotionsLexicon).forEach(([emotion, wordList]) => {
          if (wordList.includes(word)) {
            // Find if this emotion term is negated
            const isNegated = this.isTermNegated(term, negations);
            
            // Find if this emotion term is intensified
            const intensityMultiplier = this.getTermIntensity(term, intensifiers);
            
            // Calculate base emotion count (higher for more specific emotions, lower for 'neutral')
            let countValue = emotion === 'neutral' ? 0.5 : 1.0;
            
            // Apply negation if applicable
            if (isNegated) {
              // If negated, invert the emotion (for most emotions, except neutral)
              if (emotion !== 'neutral') {
                // Instead of just negating, convert to the opposite emotion when applicable
                if (emotion === 'joy') {
                  emotionCounts['sadness'] += countValue * intensityMultiplier;
                  emotionTerms['sadness'].push({
                    text: `not ${term.text()}`,
                    index: currentIndex,
                    context: sentenceIdx
                  });
                } else if (emotion === 'sadness') {
                  emotionCounts['joy'] += countValue * intensityMultiplier * 0.7; // Less powerful conversion
                  emotionTerms['joy'].push({
                    text: `not ${term.text()}`,
                    index: currentIndex,
                    context: sentenceIdx
                  });
                } else if (emotion === 'love') {
                  emotionCounts['anger'] += countValue * intensityMultiplier * 0.8;
                  emotionTerms['anger'].push({
                    text: `not ${term.text()}`,
                    index: currentIndex,
                    context: sentenceIdx
                  });
                } else if (emotion === 'anger') {
                  emotionCounts['neutral'] += countValue * intensityMultiplier * 0.9;
                  emotionTerms['neutral'].push({
                    text: `not ${term.text()}`,
                    index: currentIndex,
                    context: sentenceIdx
                  });
                } else if (emotion === 'optimism') {
                  emotionCounts['sadness'] += countValue * intensityMultiplier * 0.7;
                  emotionTerms['sadness'].push({
                    text: `not ${term.text()}`,
                    index: currentIndex,
                    context: sentenceIdx
                  });
                } else {
                  // For other emotions, just reduce the count
                  emotionCounts[emotion] -= countValue * 0.8;
                  emotionCounts['neutral'] += countValue * 0.3;
                  emotionTerms['neutral'].push({
                    text: `not ${term.text()}`,
                    index: currentIndex,
                    context: sentenceIdx
                  });
                }
              }
            } else {
              // Not negated, add the emotion count with intensity multiplier
              emotionCounts[emotion] += countValue * intensityMultiplier;
              emotionTerms[emotion].push({
                text: term.text(),
                index: currentIndex,
                context: sentenceIdx
              });
            }
          }
        });
        
        // Move index forward by the length of the term and any trailing space
        wordIndex += term.text().length + (term.post() ? term.post().length : 0);
      });
    });
    
    // Analyze questionmarks and exclamation marks
    const questionMarks = (text.match(/\?/g) || []).length;
    const exclamationMarks = (text.match(/!/g) || []).length;
    
    // Questions often indicate confusion or surprise
    if (questionMarks > 0) {
      emotionCounts['confusion'] += questionMarks * 0.5;
      
      // Multiple question marks could indicate stronger confusion or surprise
      if (questionMarks >= 2) {
        emotionCounts['surprise'] += (questionMarks - 1) * 0.4;
      }
    }
    
    // Exclamation marks often intensify emotions
    if (exclamationMarks > 0) {
      // Increase intensity of the strongest existing emotion
      const highestEmotions = Object.entries(emotionCounts)
        .filter(([emotion]) => emotion !== 'neutral')
        .sort((a, b) => b[1] - a[1]);
      
      if (highestEmotions.length > 0) {
        const [strongestEmotion] = highestEmotions[0];
        emotionCounts[strongestEmotion] += exclamationMarks * 0.6;
      } else {
        // If no clear emotion, multiple exclamation marks suggest surprise or excitement
        emotionCounts['surprise'] += exclamationMarks * 0.5;
        
        // Add some joy or anger depending on the overall sentiment
        if (this.hasPositiveWords(text)) {
          emotionCounts['joy'] += exclamationMarks * 0.4;
        } else if (this.hasNegativeWords(text)) {
          emotionCounts['anger'] += exclamationMarks * 0.4;
        }
      }
    }
    
    // Handle ALL CAPS text (often indicates intensity)
    const words = text.split(/\s+/);
    const capsWordCount = words.filter(word => word.length > 1 && word === word.toUpperCase()).length;
    
    if (capsWordCount > 1 || capsWordCount / words.length > 0.3) { // If multiple caps words or significant percentage
      // Amplify the dominant non-neutral emotion
      const nonNeutralEmotions = Object.entries(emotionCounts)
        .filter(([emotion]) => emotion !== 'neutral')
        .sort((a, b) => b[1] - a[1]);
      
      if (nonNeutralEmotions.length > 0) {
        const [strongestEmotion] = nonNeutralEmotions[0];
        emotionCounts[strongestEmotion] *= 1.5;
      }
    }
    
    // If no significant emotions were detected, increase neutral
    const totalEmotionScore = Object.values(emotionCounts).reduce((sum, count) => sum + count, 0);
    if (totalEmotionScore < 0.5) {
      emotionCounts['neutral'] += 1;
    }
    
    // Convert counts to probabilities
    const predictions = this.countsToProbabilities(emotionCounts);
    
    // Generate annotations for highlighting
    const annotations = this.generateAnnotations(text, emotionTerms);
    
    return {
      predictions,
      annotations
    };
  }

  /**
   * Run emotion detection
   * @param text Input text to analyze
   * @returns Emotion prediction scores and annotations
   */
  run(text: string): EmotionResult {
    return this.classify(text);
  }

  /**
   * Find negation terms in the text
   * @param doc Compromise document
   * @returns Array of negation terms with their positions
   */
  private findNegationTerms(doc: any): { term: any, index: number }[] {
    const negations: { term: any, index: number }[] = [];
    let index = 0;
    
    doc.terms().forEach(term => {
      if (this.negationTerms.includes(term.text().toLowerCase())) {
        negations.push({
          term,
          index
        });
      }
      index += term.text().length + (term.post() ? term.post().length : 0);
    });
    
    return negations;
  }
  
  /**
   * Find intensifier terms in the text
   * @param doc Compromise document
   * @returns Array of intensifier terms with their positions and intensities
   */
  private findIntensifierTerms(doc: any): { term: any, index: number, intensity: number }[] {
    const intensifiers: { term: any, index: number, intensity: number }[] = [];
    let index = 0;
    
    doc.terms().forEach(term => {
      const wordLower = term.text().toLowerCase();
      if (this.intensifierTerms[wordLower]) {
        intensifiers.push({
          term,
          index,
          intensity: this.intensifierTerms[wordLower]
        });
      }
      index += term.text().length + (term.post() ? term.post().length : 0);
    });
    
    return intensifiers;
  }
  
  /**
   * Check if a term is negated by any negation in the sentence
   * @param term The term to check
   * @param negations List of negation terms in the sentence
   * @returns Boolean indicating if the term is negated
   */
  private isTermNegated(term: any, negations: { term: any, index: number }[]): boolean {
    // Get position of the term in the text
    const termPosition = term.index();
    
    // Check if a negation term appears within 3 terms before this term
    return negations.some(negation => {
      const negationPosition = negation.term.index();
      return negationPosition < termPosition && termPosition - negationPosition <= 3;
    });
  }
  
  /**
   * Get intensity multiplier for a term based on nearby intensifiers
   * @param term The term to check
   * @param intensifiers List of intensifier terms in the sentence
   * @returns Intensity multiplier (default is 1.0)
   */
  private getTermIntensity(term: any, intensifiers: { term: any, index: number, intensity: number }[]): number {
    // Get position of the term in the text
    const termPosition = term.index();
    
    // Find intensifiers that appear before this term
    const relevantIntensifiers = intensifiers.filter(intensifier => {
      const intensifierPosition = intensifier.term.index();
      return intensifierPosition < termPosition && termPosition - intensifierPosition <= 2;
    });
    
    // If no relevant intensifiers, return default multiplier
    if (relevantIntensifiers.length === 0) {
      return 1.0;
    }
    
    // Use the strongest intensifier
    return Math.max(...relevantIntensifiers.map(i => i.intensity));
  }
  
  /**
   * Check if text has positive sentiment words
   */
  private hasPositiveWords(text: string): boolean {
    const positiveWords = ['good', 'great', 'excellent', 'wonderful', 'amazing', 'love', 'best', 'happy'];
    return positiveWords.some(word => text.toLowerCase().includes(word));
  }
  
  /**
   * Check if text has negative sentiment words
   */
  private hasNegativeWords(text: string): boolean {
    const negativeWords = ['bad', 'terrible', 'awful', 'worst', 'horrible', 'hate', 'stupid', 'angry'];
    return negativeWords.some(word => text.toLowerCase().includes(word));
  }

  /**
   * Convert emotion word counts to probability distribution
   * @param counts Counts of emotion words by category
   * @returns Normalized probability distribution
   */
  private countsToProbabilities(counts: Record<string, number>): Record<string, number> {
    // Get total count for normalization
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    
    // Handle case where no emotion words were found
    if (total === 0) {
      return { 'neutral': 1.0 };
    }
    
    // Convert counts to probabilities
    const probabilities = Object.entries(counts).reduce((result, [emotion, count]) => {
      result[emotion] = count / total;
      return result;
    }, {} as Record<string, number>);
    
    // Round to 3 decimal places
    Object.keys(probabilities).forEach(emotion => {
      probabilities[emotion] = parseFloat(probabilities[emotion].toFixed(3));
    });
    
    // Filter out emotions with very low probabilities
    const significantEmotions = Object.entries(probabilities)
      .filter(([_, value]) => value >= 0.05)
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {} as Record<string, number>);
    
    // If no significant emotions, return neutral
    if (Object.keys(significantEmotions).length === 0) {
      return { 'neutral': 1.0 };
    }
    
    // Renormalize the significant emotions
    const newTotal = Object.values(significantEmotions).reduce((sum, prob) => sum + prob, 0);
    Object.keys(significantEmotions).forEach(emotion => {
      significantEmotions[emotion] = parseFloat((significantEmotions[emotion] / newTotal).toFixed(3));
    });
    
    return significantEmotions;
  }

  /**
   * Generate text annotations for highlighting emotion words
   * @param text Input text
   * @param emotionTerms Emotion terms with positions by category
   * @returns Text annotations for highlighting
   */
  private generateAnnotations(
    text: string,
    emotionTerms: Record<string, { text: string, index: number, context: number }[]>
  ): { text: string, type: string | null, color: string | null }[] {
    // Flatten all emotion terms into a single array with type information
    const allTerms = Object.entries(emotionTerms).flatMap(([emotion, terms]) => 
      terms.map(term => ({
        ...term,
        type: emotion,
        color: this.emotionColors[emotion]
      }))
    );
    
    // If no emotion terms found, return the whole text without annotations
    if (allTerms.length === 0) {
      return [{ text, type: null, color: null }];
    }
    
    // Sort by position in text
    allTerms.sort((a, b) => a.index - b.index);
    
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
} 