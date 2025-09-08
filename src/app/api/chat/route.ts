import { NextRequest, NextResponse } from 'next/server';
import { 
  POSTagging, 
  KeywordExtractor, 
  SentimentAnalysis, 
  EmotionDetection, 
  NamedEntityRecognition,
  findPrimaryEmotion,
  findPrimarySentiment,
  calculateConfidence,
  calculateSentimentStrength,
  mergeOverlappingAnnotations,
  Entity
} from '@/lib/nlp';

// Initialize NLP processors with singleton instances
const emotionDetection = new EmotionDetection();
const sentimentAnalysis = new SentimentAnalysis();
const keywordExtractor = new KeywordExtractor();
const namedEntityRecognition = new NamedEntityRecognition();
const posTagging = new POSTagging();

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
    if (lastUserMessage && lastUserMessage.content) {
      userAnalysis = await analyzeUserMessage(lastUserMessage.content);
    }

    let aiMessage = '';

    // Prefer Groq if configured; fallback to Gemini if not
    if (GROQ_API_KEY && GROQ_API_KEY.trim() !== '') {
      // Build OpenAI-compatible chat payload
      const systemFromMessages = (messages.find((m: any) => m.role === 'system')?.content || '').trim();
      const finalSystem = (systemPrompt && typeof systemPrompt === 'string' && systemPrompt.trim()) || systemFromMessages || '';

      const conversationMessages = messages
        .filter((m: any) => m.role !== 'system')
        .map((m: any) => ({ role: m.role, content: m.content }));

      const openaiMessages = finalSystem
        ? [{ role: 'system', content: finalSystem }, ...conversationMessages]
        : conversationMessages;

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
      // Fallback: original Gemini path, unchanged in behavior
      const systemFromMessages = (messages.find((m: any) => m.role === 'system')?.content || '').trim();
      const finalSystem = (systemPrompt && typeof systemPrompt === 'string' && systemPrompt.trim()) || systemFromMessages || '';
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
      // No configured provider
      return NextResponse.json({
        ...createFallbackResponse("I'm having trouble connecting to my systems. Please check the API configuration."),
        error: 'Missing API key (GROQ_API_KEY or GEMINI_API_KEY)'
      }, { status: 200 });
    }

    // Perform comprehensive NLP analysis on the AI's response with safeguards
    let emotionResult: any, sentimentResult: any, keywordsResult: any, nerResult: any, posResult: any;

    try {
      [emotionResult, sentimentResult, keywordsResult, nerResult, posResult] = await Promise.all([
        emotionDetection.classify(aiMessage).catch(() => ({ predictions: { neutral: 1 }, annotations: [] })),
        sentimentAnalysis.classify(aiMessage).catch(() => ({ predictions: { Neutral: 1, Positive: 0, Negative: 0 }, annotations: [] })),
        keywordExtractor.generate(aiMessage, 5).catch(() => ({ keywords: [] })),
        namedEntityRecognition.classify(aiMessage).catch(() => ({ entities: [], annotations: [] })),
        posTagging.classify(aiMessage).catch(() => ({ tags: [] }))
      ]);
    } catch (nlpError) {
      console.error('NLP processing error:', nlpError);
      // Continue with basic analysis if any part fails
      emotionResult = { predictions: { neutral: 1 }, annotations: [] };
      sentimentResult = { predictions: { Neutral: 1, Positive: 0, Negative: 0 }, annotations: [] };
      keywordsResult = { keywords: [] };
      nerResult = { entities: [], annotations: [] };
      posResult = { tags: [] };
    }

    // Enhanced emotion information with confidence scores
    const emotionInfo = enhanceEmotionInfo(emotionResult);

    // Process sentiment with more detail
    const sentimentInfo = enhanceSentimentInfo(sentimentResult);

    // Format the AI's response with enhanced NLP insights
    return NextResponse.json({
      message: aiMessage,
      analysis: {
        emotion: emotionInfo,
        sentiment: sentimentInfo,
        keywords: keywordsResult.keywords || [],
        entities: nerResult.entities?.map((e: Entity) => ({ text: e.text, type: e.type })) || []
      },
      userAnalysis,
      annotations: {
        emotion: emotionResult.annotations || [],
        sentiment: sentimentResult.annotations || [],
        entities: nerResult.annotations || []
      },
      // Include conversational insight that might help the UI
      conversationalInsight: {
        topicsDetected: keywordsResult.keywords || [],
        emotionalTone: emotionInfo.primary,
        responseComplexity: assessResponseComplexity(posResult)
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
async function analyzeUserMessage(text: string) {
  try {
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return getDefaultAnalysis();
    }

    const [emotion, sentiment, keywords, entities] = await Promise.all([
      emotionDetection.classify(text).catch(() => ({ predictions: { neutral: 1 } })),
      sentimentAnalysis.classify(text).catch(() => ({ predictions: { Neutral: 0.7, Positive: 0.2, Negative: 0.1 } })),
      keywordExtractor.generate(text, 3).catch(() => ({ keywords: [] })),
      namedEntityRecognition.classify(text).catch(() => ({ entities: [] }))
    ]);

    // Calculate primary emotions and confidence metrics
    const primaryEmotion = findPrimaryEmotion(emotion.predictions);
    const emotionConfidence = calculateConfidence(emotion.predictions);

    // Calculate primary sentiment and strength
    const primarySentiment = findPrimarySentiment(sentiment.predictions);
    const sentimentStrength = calculateSentimentStrength(sentiment.predictions);

    // Format emotion data for UI display
    const formattedEmotions = Object.entries(emotion.predictions || {}).map(([emotion, score]) => ({
      emotion,
      score: parseFloat((score as number).toFixed(3)),
      isPrimary: (emotion as string).toLowerCase() === primaryEmotion
    })).sort((a, b) => b.score - a.score);

    return {
      emotion: {
        primary: primaryEmotion,
        predictions: emotion.predictions,
        confidence: emotionConfidence,
        all: formattedEmotions
      },
      sentiment: {
        primary: primarySentiment,
        predictions: sentiment.predictions,
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

// Enhance emotion information for the response
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
  const primary = findPrimaryEmotion(emotionResult.predictions);

  // Calculate confidence level
  const confidence = calculateConfidence(emotionResult.predictions);

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

// Enhance sentiment information
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
  const primary = findPrimarySentiment(sentimentResult.predictions);
  const strength = calculateSentimentStrength(sentimentResult.predictions);

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

// Assess the complexity of the AI's response based on POS analysis
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
