/**
 * Utils for NLP operations
 */

// Helper function to create annotations for highlighting
export const createAnnotations = (text: string, entities: any[], colorMap: Record<string, string> = {}) => {
  if (!entities || entities.length === 0) return [{ text, type: null, color: null }];
  
  // Sort entities by start position (ascending)
  const sortedEntities = [...entities].sort((a, b) => a.start - b.start);
  
  const annotations = [];
  let lastIndex = 0;
  
  for (const entity of sortedEntities) {
    // Add text before entity
    if (entity.start > lastIndex) {
      annotations.push({
        text: text.substring(lastIndex, entity.start),
        type: null,
        color: null
      });
    }
    
    // Add the entity with appropriate color
    const color = colorMap[entity.type] || "#26aaef";
    annotations.push({
      text: text.substring(entity.start, entity.end),
      type: entity.type,
      color
    });
    
    lastIndex = entity.end;
  }
  
  // Add remaining text after last entity
  if (lastIndex < text.length) {
    annotations.push({
      text: text.substring(lastIndex),
      type: null,
      color: null
    });
  }
  
  return annotations;
};

// Merge overlapping annotations
export const mergeOverlappingAnnotations = (annotations: { start: number, end: number, type: string }[]) => {
  if (!annotations.length) return [];
  
  // Sort by start position
  const sorted = [...annotations].sort((a, b) => a.start - b.start);
  const merged = [sorted[0]];
  
  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];
    
    // Check for overlap
    if (current.start <= last.end) {
      // Merge overlapping regions
      last.end = Math.max(last.end, current.end);
    } else {
      merged.push(current);
    }
  }
  
  return merged;
};

// Simple word frequency-based keyword extraction (fallback method)
export const extractKeywordsBasic = (text: string, maxKeywords = 5) => {
  const words = text.toLowerCase().match(/\b[a-z][a-z-]{2,}\b/g) || [];
  const stopWords = new Set([
    'the', 'and', 'that', 'this', 'with', 'for', 'from', 'have', 'has', 'had', 
    'was', 'were', 'will', 'would', 'could', 'should', 'can', 'what', 'when', 
    'where', 'who', 'why', 'how', 'which', 'there', 'their', 'they', 'them', 
    'these', 'those', 'then', 'than', 'some', 'such', 'very', 'just', 'about',
    'into', 'over', 'also', 'after', 'before', 'because', 'under', 'through',
    'during', 'again', 'further', 'then', 'once', 'here', 'now', 'only', 'any',
    'both', 'each', 'few', 'more', 'most', 'other', 'many', 'much', 'been',
    'being', 'having', 'your', 'yours', 'yourself', 'yourselves', 'himself',
    'herself', 'itself', 'ourselves', 'themselves', 'myself', 'itself'
  ]);
  
  const wordFreq: Record<string, number> = {};
  
  for (const word of words) {
    if (!stopWords.has(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  }
  
  // Sort by frequency
  const keywords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(entry => entry[0]);
    
  return keywords;
};

// Calculate basic sentiment score (-1 to 1) with enhanced lexicons and contextual awareness
export const calculateBasicSentiment = (text: string) => {
  if (!text || typeof text !== 'string') return 0;
  
  const positive = [
    'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'terrific', 
    'love', 'happy', 'positive', 'best', 'better', 'impressive', 'beautiful', 
    'perfect', 'awesome', 'brilliant', 'outstanding', 'superb', 'incredible',
    'delighted', 'pleased', 'glad', 'excited', 'thrilled', 'enjoy', 'enjoying',
    'enjoyed', 'appreciate', 'appreciating', 'appreciated', 'beneficial', 'success',
    'successful', 'recommend', 'satisfied', 'satisfaction', 'helpful', 'effective',
    'efficient', 'exceptional', 'remarkable', 'superior', 'marvelous', 'splendid'
  ];
  
  const negative = [
    'bad', 'awful', 'terrible', 'horrible', 'poor', 'disappointed', 'negative', 
    'worst', 'worse', 'hate', 'dislike', 'unfortunate', 'sad', 'angry', 'annoyed',
    'annoying', 'useless', 'worthless', 'unhappy', 'hated', 'disliked', 'pessimistic',
    'ineffective', 'inefficient', 'failure', 'failed', 'fails', 'problem', 'problematic',
    'trouble', 'troubling', 'suck', 'sucks', 'sucked', 'atrocious', 'unfair', 
    'unpleasant', 'unsuccessful', 'unsatisfied', 'appalling', 'deplorable', 'disgraceful'
  ];
  
  // Negation terms that can reverse sentiment
  const negations = [
    'not', 'no', 'never', 'none', 'nothing', 'neither', 'nor', 'hardly', 'rarely',
    'scarcely', 'barely', 'seldom', "doesn't", "don't", "didn't", "won't", 
    "wouldn't", "couldn't", "can't", 'cannot', "isn't", "aren't", "wasn't", 
    "weren't", "hadn't", "hasn't", "haven't"
  ];
  
  // Intensifiers that strengthen sentiment
  const intensifiers = [
    'very', 'extremely', 'really', 'absolutely', 'completely', 'totally', 'utterly',
    'incredibly', 'exceedingly', 'especially', 'exceptionally', 'particularly',
    'truly', 'remarkably', 'highly', 'immensely', 'enormously', 'thoroughly',
    'entirely', 'fully', 'greatly', 'deeply', 'profoundly', 'seriously', 'badly'
  ];
  
  // Contrast conjunctions that might indicate a shift in sentiment
  const contrastWords = [
    'but', 'however', 'nevertheless', 'nonetheless', 'yet', 'although', 'though',
    'even though', 'despite', 'in spite of', 'regardless', 'notwithstanding'
  ];
  
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  let score = 0;
  
  // Track negations and intensifiers
  const negationIndices: number[] = [];
  const intensifierIndices: number[] = [];
  const contrastIndices: number[] = [];
  
  // First pass: identify negations, intensifiers, and contrast words
  words.forEach((word, index) => {
    if (negations.includes(word)) negationIndices.push(index);
    if (intensifiers.includes(word)) intensifierIndices.push(index);
    if (contrastWords.includes(word)) contrastIndices.push(index);
  });
  
  // Second pass: calculate sentiment with context
  words.forEach((word, index) => {
    let termScore = 0;
    let intensity = 1.0;
    
    // Check if word is positive or negative
    if (positive.includes(word)) {
      termScore = 1;
    } else if (negative.includes(word)) {
      termScore = -1;
    }
    
    // If term has sentiment, process modifiers
    if (termScore !== 0) {
      // Check for preceding intensifiers (within 2 words)
      const relevantIntensifiers = intensifierIndices.filter(i => 
        i < index && index - i <= 2
      );
      
      if (relevantIntensifiers.length > 0) {
        // Apply intensity boost (more words = stronger effect)
        intensity = 1.0 + (relevantIntensifiers.length * 0.5);
      }
      
      // Check for preceding negations (within 3 words)
      const isNegated = negationIndices.some(negIndex => 
        negIndex < index && index - negIndex <= 3
      );
      
      if (isNegated) {
        // Reverse sentiment direction but dampen effect slightly
        termScore = -termScore * 0.8;
      }
      
      // Check if this term comes after a contrast conjunction
      const afterContrast = contrastIndices.some(contrastIndex =>
        contrastIndex < index && 
        // No other contrast words between this one and the current term
        !contrastIndices.some(c => c > contrastIndex && c < index)
      );
      
      // Terms after contrast conjunctions have higher weight
      if (afterContrast) {
        intensity *= 1.5;
      }
      
      // Add weighted score
      score += termScore * intensity;
    }
  });
  
  // Check for emoticons as an additional factor
  const positiveEmoticons = (text.match(/[:;]-?[)D]/g) || []).length;
  const negativeEmoticons = (text.match(/[:;]-?[\(\[]/g) || []).length;
  
  score += positiveEmoticons * 1.5;
  score -= negativeEmoticons * 1.5;
  
  // Normalize score based on text length
  const normalizer = Math.sqrt(Math.max(1, words.length));
  
  // Clamp between -1 and 1
  return Math.max(-1, Math.min(1, score / normalizer));
};

// Find primary sentiment from predictions
export const findPrimarySentiment = (predictions: Record<string, number>): string => {
  if (!predictions) return 'neutral';
  
  // Find sentiment with highest score
  const entries = Object.entries(predictions);
  if (entries.length === 0) return 'neutral';
  
  const highestSentiment = entries.sort((a, b) => b[1] - a[1])[0];
  return highestSentiment[0].toLowerCase();
};

// Find primary emotion from predictions
export const findPrimaryEmotion = (predictions: Record<string, number>): string => {
  if (!predictions) return 'neutral';
  
  // Find emotion with highest score
  const entries = Object.entries(predictions);
  if (entries.length === 0) return 'neutral';
  
  const highestEmotion = entries.sort((a, b) => b[1] - a[1])[0];
  return highestEmotion[0].toLowerCase();
};

// Calculate confidence of the emotion prediction
export const calculateConfidence = (predictions: Record<string, number>): number => {
  if (!predictions || Object.keys(predictions).length === 0) return 0.5;
  
  const values = Object.values(predictions);
  const max = Math.max(...values);
  
  // Confidence is based on how much the top prediction stands out
  // If there's a clear winner, confidence is high
  const sortedValues = [...values].sort((a, b) => b - a);
  
  // If there's only one emotion, confidence is the value itself
  if (sortedValues.length === 1) return sortedValues[0];
  
  // If there are multiple emotions, confidence is based on the difference 
  // between the highest and second highest
  const diff = sortedValues[0] - sortedValues[1];
  
  // Normalize to 0-1 range
  return Math.min(1, 0.5 + diff * 2);
};

// Calculate sentiment strength based on how far from neutral
export const calculateSentimentStrength = (
  predictions: { Negative: number; Neutral: number; Positive: number }
): number => {
  if (!predictions) return 0.5;
  
  const { Negative, Neutral, Positive } = predictions;
  
  // Sentiment strength is how far from neutral in either direction
  return Math.max(
    Math.abs(Positive - Neutral),
    Math.abs(Negative - Neutral)
  );
}; 