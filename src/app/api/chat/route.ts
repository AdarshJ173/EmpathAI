import { NextRequest, NextResponse } from 'next/server';
import { EmotionDetection } from '@/lib/nlp/emotionDetection';
import { SentimentAnalysis } from '@/lib/nlp/sentimentAnalysis';
import { KeywordExtractor } from '@/lib/nlp/keywordExtraction';
import { NamedEntityRecognition } from '@/lib/nlp/namedEntityRecognition';
import { POSTagging } from '@/lib/nlp/posTagging';
import { findPrimaryEmotion, findPrimarySentiment, calculateConfidence, calculateSentimentStrength } from '@/lib/nlp/utils';

// Initialize NLP processors with singleton instances
const emotionDetection = new EmotionDetection();
const sentimentAnalysis = new SentimentAnalysis();
const keywordExtractor = new KeywordExtractor();
const namedEntityRecognition = new NamedEntityRecognition();
const posTagging = new POSTagging();

// Replace the hardcoded API key with environment variable
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const OPENROUTER_REFERRER = process.env.NEXT_PUBLIC_OPENROUTER_REFERRER || "https://empathAI.com";
const MODEL = "qwen/qwen-2.5-72b-instruct:free";

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
    // Extract messages from request
    const { messages } = await request.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({
        ...createFallbackResponse("I received an invalid request format. Please try again with valid messages."),
        error: "Invalid request format"
      }, { status: 400 });
    }
    
    // Validate that messages have the expected format
    const invalidMessages = messages.filter(msg => !msg.role || !msg.content);
    if (invalidMessages.length > 0) {
      return NextResponse.json({
        ...createFallbackResponse("Some messages in your request have an invalid format. Please ensure all messages have a role and content."),
        error: "Invalid message format"
      }, { status: 400 });
    }
    
    // Extract the user's last message for analysis
    const userMessages = messages.filter(m => m.role === 'user');
    const lastUserMessage = userMessages.length > 0 ? userMessages[userMessages.length - 1] : null;
    
    // Analyze the user's message if available
    let userAnalysis = null;
    if (lastUserMessage && lastUserMessage.content) {
      userAnalysis = await analyzeUserMessage(lastUserMessage.content);
    }
    
    // Format messages for the external API
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
    
    // Create request options
    let apiResponse;
    try {
      // Call external API for chat completion
      apiResponse = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer": OPENROUTER_REFERRER
          },
          body: JSON.stringify({
            model: MODEL,
            messages: formattedMessages
          }),
        }
      );
      
      if (!apiResponse.ok) {
        // Handle API error
        const errorData = await apiResponse.json().catch(() => null);
        const errorMessage = errorData?.error?.message || `API returned status ${apiResponse.status}`;
        console.error("API error:", errorMessage);
        
        return NextResponse.json({
          ...createFallbackResponse(
            "I'm having trouble connecting to my systems. Please try again in a moment."
          ),
          error: errorMessage
        }, { status: 200 }); // Return 200 so the frontend can display the message
      }
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      return NextResponse.json({
        ...createFallbackResponse(
          "I'm having difficulty reaching my knowledge systems. Please check your connection and try again."
        ),
        error: "Network error"
      }, { status: 200 }); // Return 200 so the frontend can display the message
    }
    
    // Parse the response data
    let data;
    try {
      data = await apiResponse.json();
      if (!data?.choices?.[0]?.message?.content) {
        throw new Error("Invalid API response format");
      }
    } catch (parseError) {
      console.error("Failed to parse API response:", parseError);
      return NextResponse.json({
        ...createFallbackResponse("I received an unexpected response format. Please try again."),
        error: "Failed to parse API response"
      }, { status: 200 });
    }
    
    const aiMessage = data.choices[0].message.content;
    
    // Perform comprehensive NLP analysis on the AI's response with safeguards
    let emotionResult, sentimentResult, keywordsResult, nerResult, posResult;
    
    try {
      [emotionResult, sentimentResult, keywordsResult, nerResult, posResult] = await Promise.all([
        emotionDetection.classify(aiMessage).catch(() => ({ predictions: { neutral: 1 }, annotations: [] })),
        sentimentAnalysis.classify(aiMessage).catch(() => ({ predictions: { Neutral: 1, Positive: 0, Negative: 0 }, annotations: [] })),
        keywordExtractor.generate(aiMessage, 5).catch(() => ({ keywords: [] })),
        namedEntityRecognition.classify(aiMessage).catch(() => ({ entities: [], annotations: [] })),
        posTagging.classify(aiMessage).catch(() => ({ tags: [] }))
      ]);
    } catch (nlpError) {
      console.error("NLP processing error:", nlpError);
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
        entities: nerResult.entities?.map(e => ({ text: e.text, type: e.type })) || []
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
    console.error("Critical error in chat API route:", error);
    return NextResponse.json({
      ...createFallbackResponse("I apologize for the difficulty. I'm experiencing a temporary issue. Please try again in a few moments."),
      error: "Internal server error"
    }, { status: 200 }); // Return 200 so the frontend can display the message
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
      isPrimary: emotion.toLowerCase() === primaryEmotion
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
      entities: entities.entities?.map(e => ({ text: e.text, type: e.type })) || []
    };
  } catch (error) {
    console.error("Error analyzing user message:", error);
    return getDefaultAnalysis();
  }
}

// Provide default analysis when processing fails
function getDefaultAnalysis() {
  return {
    emotion: {
      primary: "neutral",
      predictions: { neutral: 1 },
      confidence: 1,
      all: [{ emotion: 'neutral', score: 1, isPrimary: true }]
    },
    sentiment: {
      primary: "neutral",
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
    isPrimary: emotion.toLowerCase() === primary
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
    const nounCount = tags.filter(tag => tag.includes('NN')).length;
    const verbCount = tags.filter(tag => tag.includes('VB')).length;
    const adjCount = tags.filter(tag => tag.includes('JJ')).length;
    const advCount = tags.filter(tag => tag.includes('RB')).length;
    
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
    console.error("Error assessing response complexity:", error);
    return 'medium';
  }
} 