import { NextRequest, NextResponse } from 'next/server';
import { analyzeEmotions, toUiEmotionDetails, synthesizeTone } from '@/lib/emotion';
import { getAdvancedPrompt } from '@/lib/prompt-engineering';

export const maxDuration = 30;

// Lightweight keyword extractor (stopword-based)
const STOPWORDS = new Set(['a','an','the','and','or','but','if','then','is','are','was','were','be','to','of','in','on','for','with','as','it','this','that','at','by','from','so','i','im','i\'m','me','my','mine','you','your','yours']);
function keywordsFrom(text: string, max = 6) {
  return Array.from(
    (text.toLowerCase().match(/[a-z][a-z']+/g) || [])
      .filter(w => !STOPWORDS.has(w))
      .reduce((m: Map<string, number>, w) => m.set(w, (m.get(w) || 0) + 1), new Map<string, number>())
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([w]) => w);
}

type Entity = { text: string; type: string };

// API keys and models (server-side only)
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

// Keep Gemini as a fallback to avoid breaking existing flows
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = "gemini-1.5-flash";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "EmpathAI";

// Fallback response to use when NLP processing fails
const createFallbackResponse = (message: string) => {
  return {
    message,
    analysis: {
      emotion: {
        primary: 'neutral',
        confidence: 0.8,
        all: [{ emotion: 'neutral', score: 0.8, isPrimary: true }]
      },
      sentiment: {
        primary: 'neutral',
        strength: 0.5,
        predictions: { Positive: 0.3, Neutral: 0.6, Negative: 0.1 }
      },
      keywords: [],
      entities: []
    }
  };
};

export async function POST(request: NextRequest) {
  try {
    // Extract messages (and optional systemPrompt passthrough) from request
    const { messages, systemPrompt } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({
        ...createFallbackResponse("I received an invalid request format. Please try again with valid messages."),
        error: "Invalid request format"
      }, { status: 400 });
    }

    // Validate that messages have the expected format
    const invalidMessages = messages.filter((msg: any) => !msg.role || !msg.content);
    if (invalidMessages.length > 0) {
      return NextResponse.json({
        ...createFallbackResponse("Some messages in your request have an invalid format. Please ensure all messages have a role and content."),
        error: "Invalid message format"
      }, { status: 400 });
    }

    // Extract the user's last message for analysis
    const userMessages = messages.filter((m: any) => m.role === 'user');
    const lastUserMessage = userMessages.length > 0 ? userMessages[userMessages.length - 1] : null;

// Analyze the user's message if available
    let userAnalysis = null as any;
    let userEmotionForSystem: { top: any[]; dist: any[] } | null = null;
    if (lastUserMessage && lastUserMessage.content) {
      // Run robust, local emotion analysis (Transformers.js); never fail the request
      try {
        const emotionAnalysis = await analyzeEmotions(lastUserMessage.content);
        userEmotionForSystem = emotionAnalysis;
        userAnalysis = await analyzeUserMessage(lastUserMessage.content, emotionAnalysis);
      } catch (e) {
        console.warn('Emotion analysis failed, continuing with defaults:', e);
        userEmotionForSystem = null;
        userAnalysis = await analyzeUserMessage(lastUserMessage.content).catch(() => getDefaultAnalysis());
      }
    }

    let aiMessage = '';

    // Prefer Groq if configured; fallback to Gemini if not
    if (GROQ_API_KEY && GROQ_API_KEY.trim() !== '') {
      // Build OpenAI-compatible chat payload
      const systemFromMessages = (messages.find((m: any) => m.role === 'system')?.content || '').trim();

      // Build advanced dynamic system prompt using conversation and emotion context (server-side)
      const convoForPrompt = messages.map((m: any) => ({ role: m.role, content: m.content }));
      const advancedPrompt = userEmotionForSystem
        ? getAdvancedPrompt(convoForPrompt, userEmotionForSystem as any, null as any)
        : '';

      const finalSystem = (systemPrompt && typeof systemPrompt === 'string' && systemPrompt.trim())
        || advancedPrompt
        || systemFromMessages
        || '';

      const conversationMessages = messages
        .filter((m: any) => m.role !== 'system')
        .map((m: any) => ({ role: m.role, content: m.content }));

      const openaiMessages = [{ role: 'system', content: finalSystem }, ...conversationMessages];

      let apiResponse: Response;
      try {
        apiResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: GROQ_MODEL,
            messages: openaiMessages,
            temperature: 0.7,
            top_p: 0.95,
            max_tokens: 1024,
            stream: false,
          }),
        });

        if (!apiResponse.ok) {
          const errorData = await apiResponse.json().catch(() => null as any);
          const status = apiResponse.status;
          const retryAfter = apiResponse.headers.get('retry-after') || undefined;
          const errorMessage = errorData?.error?.message || `API returned status ${status}`;

          console.error('Groq API error:', { status, errorMessage, retryAfter });

          return NextResponse.json({
            ...createFallbackResponse(
              status === 429
                ? 'I’m being rate-limited at the moment. Please wait a few seconds and try again.'
                : 'I’m having trouble connecting to my systems. Please try again in a moment.'
            ),
            error: errorMessage,
            retryAfter,
          }, { status: 200 }); // Keep 200 so the frontend can display gracefully
        }
      } catch (fetchError) {
        console.error('Groq fetch error:', fetchError);
        return NextResponse.json({
          ...createFallbackResponse(
            "I'm having difficulty reaching my knowledge systems. Please check your connection and try again."
          ),
          error: 'Network error'
        }, { status: 200 });
      }

      // Parse the response
      let data: any;
      try {
        data = await apiResponse.json();
        aiMessage = data?.choices?.[0]?.message?.content || '';
        if (!aiMessage) {
          throw new Error('Invalid Groq response format: missing content');
        }
      } catch (parseError) {
        console.error('Failed to parse Groq API response:', parseError);
        return NextResponse.json({
          ...createFallbackResponse('I received an unexpected response format. Please try again.'),
          error: 'Failed to parse API response'
        }, { status: 200 });
      }
    } else if (GEMINI_API_KEY && GEMINI_API_KEY.trim() !== '') {
      // Fallback: Gemini path with advanced prompt if available
      const systemFromMessages = (messages.find((m: any) => m.role === 'system')?.content || '').trim();
      const convoForPrompt = messages.map((m: any) => ({ role: m.role, content: m.content }));
      const advancedPrompt = userEmotionForSystem
        ? getAdvancedPrompt(convoForPrompt, userEmotionForSystem as any, null as any)
        : '';
      const finalSystem = (systemPrompt && typeof systemPrompt === 'string' && systemPrompt.trim()) || advancedPrompt || systemFromMessages || '';
      const conversationMessages = messages.filter((m: any) => m.role !== 'system');

      let apiResponse: Response;
      try {
        const requestBody: any = {
          contents: conversationMessages.map((msg: any) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
          })),
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        };

        if (finalSystem) {
          requestBody.systemInstruction = {
            parts: [{ text: finalSystem }]
          };
        }

        apiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          }
        );

        if (!apiResponse.ok) {
          const errorData = await apiResponse.json().catch(() => null);
          const errorMessage = (errorData as any)?.error?.message || `API returned status ${apiResponse.status}`;
          console.error('Gemini API error:', errorMessage);

          return NextResponse.json({
            ...createFallbackResponse(
              'I’m having trouble connecting to my systems. Please try again in a moment.'
            ),
            error: errorMessage
          }, { status: 200 });
        }
      } catch (fetchError) {
        console.error('Gemini fetch error:', fetchError);
        return NextResponse.json({
          ...createFallbackResponse(
            "I'm having difficulty reaching my knowledge systems. Please check your connection and try again."
          ),
          error: 'Network error'
        }, { status: 200 });
      }

      try {
        const data = await apiResponse.json();
        aiMessage = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!aiMessage) {
          throw new Error('Invalid Gemini response format');
        }
      } catch (parseError) {
        console.error('Failed to parse Gemini API response:', parseError);
        return NextResponse.json({
          ...createFallbackResponse('I received an unexpected response format. Please try again.'),
          error: 'Failed to parse API response'
        }, { status: 200 });
      }
    } else {
      // No configured provider – generate a high-quality local fallback reply so chat still works.
      aiMessage = generateLocalReply(lastUserMessage?.content || '', userAnalysis);
    }

    // Perform analysis on the AI's response using local components only
    const aiEmotion = await analyzeEmotions(aiMessage).catch(() => ({ dist: [{ label: 'neutral', score: 1, pct: 100 }], top: [{ label: 'neutral', score: 1, pct: 100 }] }));
    const emotionInfo = toUiEmotionDetails(aiEmotion.dist as any);

    // Derive sentiment from emotion groups
    const synth = synthesizeTone(aiEmotion.dist as any);
    const total = Math.max(1, synth.positive + synth.negative + synth.neutral);
    const sentimentInfo = {
      primary: synth.positive > synth.negative ? (synth.positive > 40 ? 'positive' : 'neutral') : (synth.negative > 40 ? 'negative' : 'neutral'),
      strength: Math.max(synth.positive, synth.negative) / 100,
      predictions: {
        Positive: Math.round((synth.positive / total) * 1000) / 1000,
        Neutral: Math.round((synth.neutral / total) * 1000) / 1000,
        Negative: Math.round((synth.negative / total) * 1000) / 1000,
      }
    };

    const kw = keywordsFrom(aiMessage, 6);

    // Format the AI's response with enhanced NLP insights
    return NextResponse.json({
      message: aiMessage,
      analysis: {
        emotion: emotionInfo,
        sentiment: sentimentInfo,
        keywords: kw,
        entities: [] as Entity[]
      },
      userAnalysis,
      annotations: {
        emotion: [],
        sentiment: [],
        entities: []
      },
      // Include conversational insight that might help the UI
      conversationalInsight: {
        topicsDetected: kw,
        emotionalTone: emotionInfo.primary,
        responseComplexity: 'medium'
      }
    });
  } catch (error) {
    console.error('Critical error in chat API route:', error);
    return NextResponse.json({
      ...createFallbackResponse("I apologize for the difficulty. I'm experiencing a temporary issue. Please try again in a few moments."),
      error: 'Internal server error'
    }, { status: 200 });
  }
}

// Analyze user message with all NLP tools
async function analyzeUserMessage(text: string, preEmotion?: { dist: { label: string; pct: number }[]; top: { label: string; pct: number }[] }) {
  try {
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return getDefaultAnalysis();
    }

    // Use robust Transformers.js emotion analysis if provided; otherwise fall back to mock
    let emotionUi: { primary: string; confidence: number; all: { emotion: string; score: number; isPrimary: boolean }[] } | null = null;
    let emotionPred: Record<string, number> = {};
    if (preEmotion) {
      emotionUi = toUiEmotionDetails(preEmotion.dist as any);
      // Convert pct (0-100) to 0-1 predictions map
      emotionPred = Object.fromEntries(preEmotion.dist.map((d: any) => [d.label, Math.round((d.pct / 100) * 1000) / 1000]));
    }

    // Derive sentiment from preEmotion and extract simple keywords deterministically
    const tone = preEmotion ? synthesizeTone(preEmotion.dist as any) : { positive: 33.3, negative: 33.3, neutral: 33.4 };
    const keywords = { keywords: keywordsFrom(text, 6) };
    const entities = { entities: [] as Entity[] };

    // Calculate primary emotions and confidence metrics
    const primaryEmotion = emotionUi?.primary || 'neutral';
    const emotionConfidence = emotionUi?.confidence ?? 1;

    // Calculate primary sentiment and strength
  // Derive sentiment from synthesized tones if available; otherwise neutral
  const total = Math.max(1, tone.positive + tone.negative + tone.neutral);
  const primarySentiment = tone.positive > tone.negative ? (tone.positive > 40 ? 'positive' : 'neutral') : (tone.negative > 40 ? 'negative' : 'neutral');
  const sentimentStrength = Math.max(tone.positive, tone.negative) / 100;

  // Format emotion data for UI display
  const formattedEmotions = (emotionUi?.all || []).map(e => ({ emotion: e.emotion, score: parseFloat((e.score as number).toFixed(3)), isPrimary: e.isPrimary }));

  return {
    emotion: {
      primary: primaryEmotion,
      predictions: Object.keys(emotionPred).length ? emotionPred : { neutral: 1 },
      confidence: emotionConfidence,
      all: formattedEmotions
    },
    sentiment: {
      primary: primarySentiment,
      predictions: {
        Positive: Math.round((tone.positive / total) * 1000) / 1000,
        Neutral: Math.round((tone.neutral / total) * 1000) / 1000,
        Negative: Math.round((tone.negative / total) * 1000) / 1000,
      },
      strength: sentimentStrength
    },
      keywords: keywords.keywords || [],
      entities: entities.entities?.map((e: Entity) => ({ text: e.text, type: e.type })) || []
    };
  } catch (error) {
    console.error('Error analyzing user message:', error);
    return getDefaultAnalysis();
  }
}

// Provide default analysis when processing fails
function getDefaultAnalysis() {
  return {
    emotion: {
      primary: 'neutral',
      predictions: { neutral: 1 },
      confidence: 1,
      all: [{ emotion: 'neutral', score: 1, isPrimary: true }]
    },
    sentiment: {
      primary: 'neutral',
      predictions: { Neutral: 0.7, Positive: 0.2, Negative: 0.1 },
      strength: 0.3
    },
    keywords: [],
    entities: []
  };
}

// Local helpers (compatibility)
function _findPrimaryEmotion(predictions: Record<string, number>): string {
  const entries = Object.entries(predictions || {});
  if (!entries.length) return 'neutral';
  return entries.sort((a, b) => (b[1] || 0) - (a[1] || 0))[0][0];
}
function _calculateConfidence(predictions: Record<string, number>): number {
  const values = Object.values(predictions || {});
  return values.length ? Math.max(...values) : 1;
}

// Enhance emotion information for the response (kept for compatibility)
function enhanceEmotionInfo(emotionResult: any) {
  // Ensure prediction data exists
  if (!emotionResult || !emotionResult.predictions) {
    return {
      primary: 'neutral',
      confidence: 1,
      all: [{ emotion: 'neutral', score: 1, isPrimary: true }]
    };
  }

  // Find the primary emotion (highest score)
  const primary = _findPrimaryEmotion(emotionResult.predictions);

  // Calculate confidence level
  const confidence = _calculateConfidence(emotionResult.predictions);

  // Format all emotions for UI display
  const allEmotions = Object.entries(emotionResult.predictions).map(([emotion, score]) => ({
    emotion,
    score: parseFloat((score as number).toFixed(3)),
    isPrimary: (emotion as string).toLowerCase() === primary
  })).sort((a, b) => b.score - a.score);

  return {
    primary,
    confidence,
    predictions: emotionResult.predictions,
    all: allEmotions
  };
}

// Simple local reply generator for full offline resilience
function generateLocalReply(userText: string, analysis: any) {
  const text = (userText || '').trim();
  const tone = (analysis?.sentiment?.primary || 'neutral') as string;
  const primaryEmotion = (analysis?.emotion?.primary || 'neutral') as string;

  const askFollowUp = () => {
    const prompts = [
      'What feels most important about this right now?',
      'Would you like to unpack what led up to this?',
      'What outcome would feel helpful for you in this moment?'
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
  };

  if (tone === 'negative') {
    return [
      `Thanks for sharing. It sounds like you might be experiencing ${primaryEmotion}. That can be really tough.`,
      'You’re not alone here and it makes sense to feel this way.',
      askFollowUp()
    ].join(' ');
  }
  if (tone === 'positive') {
    return [
      `I’m glad to hear this. I’m picking up a ${primaryEmotion} vibe.`,
      'What would you like to build on from this?',
      askFollowUp()
    ].join(' ');
  }
  return [
    'I’m here with you. I want to understand this clearly.',
    text ? `When you say “${text.slice(0, 140)}”, what part stands out the most?` : 'What’s on your mind right now?',
    askFollowUp()
  ].join(' ');
}

// Enhance sentiment information (unused now, kept for compatibility)
function _findPrimarySentiment(pred: Record<string, number>) {
  const { Positive = 0, Neutral = 0, Negative = 0 } = pred || {} as any;
  if (Positive > Neutral && Positive > Negative) return 'positive';
  if (Negative > Neutral && Negative > Positive) return 'negative';
  return 'neutral';
}
function _calculateSentimentStrength(pred: Record<string, number>) {
  const { Positive = 0, Negative = 0 } = pred || {} as any;
  return Math.max(Positive, Negative);
}

function enhanceSentimentInfo(sentimentResult: any) {
  // Ensure prediction data exists
  if (!sentimentResult || !sentimentResult.predictions) {
    return {
      primary: 'neutral',
      strength: 0.5,
      predictions: {
        Negative: 0.1,
        Neutral: 0.8,
        Positive: 0.1
      }
    };
  }

  const { Negative = 0, Neutral = 1, Positive = 0 } = sentimentResult.predictions;
  const primary = _findPrimarySentiment(sentimentResult.predictions);
  const strength = _calculateSentimentStrength(sentimentResult.predictions);

  return {
    primary,
    strength,
    predictions: {
      Negative: parseFloat(Negative.toFixed(3)),
      Neutral: parseFloat(Neutral.toFixed(3)),
      Positive: parseFloat(Positive.toFixed(3))
    }
  };
}

// Assess the complexity of the AI's response (simplified)
function assessResponseComplexity(posResult: any) {
  if (!posResult || !posResult.tags || !Array.isArray(posResult.tags)) {
    return 'medium';
  }

  try {
    const tags = posResult.tags;

    // Count different parts of speech
    const nounCount = tags.filter((tag: string) => tag.includes('NN')).length;
    const verbCount = tags.filter((tag: string) => tag.includes('VB')).length;
    const adjCount = tags.filter((tag: string) => tag.includes('JJ')).length;
    const advCount = tags.filter((tag: string) => tag.includes('RB')).length;

    // Calculate complexity score based on POS diversity and count
    const totalWords = tags.length;
    const diversityScore = (nounCount + verbCount + adjCount + advCount) / Math.max(1, totalWords);

    // Include sentence length as a factor
    const wordCount = totalWords;

    // Complex sentences often have more adjectives and adverbs relative to total words
    const descriptorRatio = (adjCount + advCount) / Math.max(1, totalWords);

    // Calculate overall complexity
    const complexityScore = (diversityScore * 0.5) + (Math.min(wordCount / 100, 1) * 0.3) + (descriptorRatio * 0.2);

    // Map to text labels
    if (complexityScore < 0.3) return 'simple';
    if (complexityScore < 0.6) return 'medium';
    return 'complex';
  } catch (error) {
    console.error('Error assessing response complexity:', error);
    return 'medium';
  }
}
