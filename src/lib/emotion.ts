// src/lib/emotion.ts
// Lightweight rule-based emotion analysis for deployment optimization
// Provides multi-label distribution with normalized percentages and convenient UI mapping.

export type EmotionItem = { label: string; score: number; pct: number };
export type EmotionAnalysis = { dist: EmotionItem[]; top: EmotionItem[] };

// Emotion detection patterns
const EMOTION_PATTERNS = {
  joy: [
    /\b(happy|joy|excited|thrilled|delighted|cheerful|elated|euphoric|blissful|glad)\b/i,
    /\b(amazing|wonderful|fantastic|great|awesome|brilliant|perfect|excellent)\b/i,
    /(!!+|😊|😄|😁|🎉|❤️)/,
  ],
  sadness: [
    /\b(sad|depressed|down|blue|melancholy|gloomy|miserable|heartbroken|sorrowful)\b/i,
    /\b(cry|tears|weep|sob|mourn|grieve|devastated|crushed)\b/i,
    /(😢|😭|💔|😞|😔)/,
  ],
  anger: [
    /\b(angry|mad|furious|rage|pissed|irritated|annoyed|frustrated|livid)\b/i,
    /\b(hate|stupid|idiot|damn|hell|wtf|bullshit)\b/i,
    /(😠|😡|🤬|💢)/,
  ],
  fear: [
    /\b(afraid|scared|terrified|anxious|worried|nervous|panic|dread|horror)\b/i,
    /\b(nightmare|threat|danger|risk|concern|uncertainty)\b/i,
    /(😨|😰|😱|😧)/,
  ],
  surprise: [
    /\b(surprised|shocked|amazed|astonished|stunned|bewildered|unexpected)\b/i,
    /\b(wow|whoa|omg|unbelievable|incredible)\b/i,
    /(😲|😯|🤯|😮)/,
  ],
  disgust: [
    /\b(disgusting|gross|revolting|repulsive|nauseating|sickening|vile)\b/i,
    /\b(yuck|ew|nasty|horrible|awful|terrible)\b/i,
    /(🤢|🤮|😷)/,
  ],
  love: [
    /\b(love|adore|cherish|treasure|affection|romance|passion|devotion)\b/i,
    /\b(sweetheart|darling|honey|babe|beautiful|gorgeous)\b/i,
    /(❤️|💕|💖|😍|🥰|💋)/,
  ],
  gratitude: [
    /\b(thank|thanks|grateful|appreciate|blessing|thankful)\b/i,
    /\b(kind|generous|helpful|support|wonderful)\b/i,
    /(🙏|💕)/,
  ],
  optimism: [
    /\b(hope|optimistic|positive|confident|bright|promising|encouraging)\b/i,
    /\b(better|improve|progress|success|achieve|accomplish)\b/i,
    /(✨|🌟|⭐|🎯)/,
  ],
  neutral: [
    /\b(okay|fine|alright|normal|regular|standard|typical)\b/i,
    /\b(maybe|perhaps|possibly|might|could|would)\b/i,
  ],
};

// Sentiment modifiers
const INTENSITY_MODIFIERS = {
  high: /\b(very|extremely|incredibly|absolutely|totally|completely|utterly|really|so|super)\b/i,
  medium: /\b(quite|rather|pretty|fairly|somewhat|moderately)\b/i,
  negation: /\b(not|no|never|none|nothing|neither|nor|can't|won't|don't|isn't|aren't)\b/i,
};

export async function analyzeEmotions(text: string): Promise<EmotionAnalysis> {
  if (!text || typeof text !== 'string') {
    return {
      dist: [{ label: 'neutral', score: 1, pct: 100 }],
      top: [{ label: 'neutral', score: 1, pct: 100 }],
    };
  }

  const emotionScores: Record<string, number> = {};
  
  // Analyze each emotion pattern
  for (const [emotion, patterns] of Object.entries(EMOTION_PATTERNS)) {
    let score = 0;
    
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        score += matches.length * 0.3; // Base score per match
        
        // Apply intensity modifiers
        const context = text.substring(
          Math.max(0, matches.index! - 20),
          Math.min(text.length, matches.index! + matches[0].length + 20)
        );
        
        if (INTENSITY_MODIFIERS.high.test(context)) score += 0.4;
        else if (INTENSITY_MODIFIERS.medium.test(context)) score += 0.2;
        
        // Check for negation
        if (INTENSITY_MODIFIERS.negation.test(context)) score *= 0.3;
      }
    }
    
    emotionScores[emotion] = Math.max(0, score);
  }
  
  // Ensure at least neutral emotion
  if (Object.values(emotionScores).every(score => score === 0)) {
    emotionScores.neutral = 0.5;
  }
  
  // Normalize scores to percentages
  const totalScore = Object.values(emotionScores).reduce((sum, score) => sum + score, 0) || 1;
  
  const dist = Object.entries(emotionScores)
    .filter(([, score]) => score > 0)
    .map(([label, score]) => ({
      label,
      score: score / totalScore,
      pct: Math.round((score / totalScore) * 1000) / 10,
    }))
    .sort((a, b) => b.pct - a.pct);
  
  const top = dist.slice(0, 3);
  
  return { dist, top };
}

// Optional deterministic aggregates for UI-friendly tags
const POSITIVE = new Set(['admiration','approval','caring','gratitude','joy','love','optimism','pride','relief']);
const NEGATIVE = new Set(['anger','annoyance','disappointment','disgust','fear','sadness','remorse','grief']);

export function synthesizeTone(dist: EmotionItem[]) {
  const sum = (labels: Set<string>) => dist.filter(x => labels.has(x.label)).reduce((a, b) => a + b.pct, 0);
  const positive = Math.round(sum(POSITIVE) * 10) / 10;
  const negative = Math.round(sum(NEGATIVE) * 10) / 10;
  const neutral = Math.max(0, Math.round((100 - positive - negative) * 10) / 10);
  return { positive, negative, neutral };
}

// Helper for mapping to the existing UI structure used by MessageDisplay
export function toUiEmotionDetails(dist: EmotionItem[]) {
  const primary = dist[0]?.label || 'neutral';
  const confidence = Math.round((dist[0]?.pct || 0) ) / 100; // convert to 0..1
  const all = dist.map(d => ({ emotion: d.label, score: d.pct / 100, isPrimary: d.label === primary }));
  return { primary, confidence, all } as { primary: string; confidence: number; all: { emotion: string; score: number; isPrimary: boolean }[] };
}
