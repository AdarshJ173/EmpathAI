import { NextRequest, NextResponse } from 'next/server';
import { POSTagging } from '@/lib/nlp/posTagging';
import { KeywordExtractor } from '@/lib/nlp/keywordExtraction';
import { SentimentAnalysis } from '@/lib/nlp/sentimentAnalysis';
import { EmotionDetection } from '@/lib/nlp/emotionDetection';
import { NamedEntityRecognition } from '@/lib/nlp/namedEntityRecognition';
import { findPrimaryEmotion, findPrimarySentiment, calculateConfidence, calculateSentimentStrength } from '@/lib/nlp/utils';

// Initialize NLP processors
const posTagging = new POSTagging();
const keywordExtractor = new KeywordExtractor();
const sentimentAnalysis = new SentimentAnalysis();
const emotionDetection = new EmotionDetection();
const namedEntityRecognition = new NamedEntityRecognition();

export async function POST(request: NextRequest) {
  try {
    const { text, tasks } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json(
        { error: "At least one task is required" },
        { status: 400 }
      );
    }

    // Process each requested task
    const results: Record<string, any> = {};
    
    // Process tasks in parallel with comprehensive error handling
    await Promise.all(tasks.map(async (task: string) => {
      try {
        switch (task) {
          case 'pos':
            results.pos = await processPOSTask(text);
            break;
            
          case 'keywords':
            const kwMaxCount = 5; // Default max keywords
            results.keywords = await processKeywordsTask(text, kwMaxCount);
            break;
            
          case 'sentiment':
            results.sentiment = await processSentimentTask(text);
            break;
            
          case 'emotion':
            results.emotion = await processEmotionTask(text);
            break;
            
          case 'ner':
            results.ner = await processNERTask(text);
            break;
            
          case 'all':
            // Process all NLP tasks
            const [posResults, keywordsResults, sentimentResults, emotionResults, nerResults] = await Promise.all([
              processPOSTask(text),
              processKeywordsTask(text, 5),
              processSentimentTask(text),
              processEmotionTask(text),
              processNERTask(text)
            ]);
            
            results.pos = posResults;
            results.keywords = keywordsResults;
            results.sentiment = sentimentResults;
            results.emotion = emotionResults;
            results.ner = nerResults;
            break;
            
          default:
            // Ignore unknown tasks
            break;
        }
      } catch (taskError) {
        console.error(`Error processing task "${task}":`, taskError);
        // Provide fallback result for failed task
        results[task] = getFallbackResult(task);
      }
    }));

    // Return all processed results
    return NextResponse.json({
      text,
      results
    });
    
  } catch (error) {
    console.error("Error processing NLP request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

/**
 * Process POS tagging task with proper error handling
 */
async function processPOSTask(text: string) {
  try {
    return posTagging.classify(text);
  } catch (error) {
    console.error("Error in POS tagging:", error);
    return { tags: [] };
  }
}

/**
 * Process keyword extraction task with proper error handling
 */
async function processKeywordsTask(text: string, maxCount: number) {
  try {
    return await keywordExtractor.generate(text, maxCount);
  } catch (error) {
    console.error("Error in keyword extraction:", error);
    return { keywords: [] };
  }
}

/**
 * Process sentiment analysis task with proper error handling
 * and enhanced result formatting
 */
async function processSentimentTask(text: string) {
  try {
    const result = sentimentAnalysis.run(text);
    
    // Ensure result has necessary properties
    const predictions = result.predictions || { Neutral: 0.7, Positive: 0.2, Negative: 0.1 };
    
    // Calculate primary sentiment and strength
    const primary = findPrimarySentiment(predictions);
    const strength = calculateSentimentStrength(predictions);
    
    return {
      predictions,
      primary,
      strength,
      annotations: result.annotations || []
    };
  } catch (error) {
    console.error("Error in sentiment analysis:", error);
    return {
      predictions: { Neutral: 0.7, Positive: 0.2, Negative: 0.1 },
      primary: 'neutral',
      strength: 0.3,
      annotations: []
    };
  }
}

/**
 * Process emotion detection task with proper error handling
 * and enhanced result formatting
 */
async function processEmotionTask(text: string) {
  try {
    const result = emotionDetection.run(text);
    
    // Ensure result has necessary properties
    const predictions = result.predictions || { neutral: 1 };
    
    // Calculate primary emotion and confidence
    const primary = findPrimaryEmotion(predictions);
    const confidence = calculateConfidence(predictions);
    
    // Format emotion results for UI display
    const formattedEmotions = Object.entries(predictions).map(([emotion, score]) => ({
      emotion,
      score: parseFloat(score.toFixed(3)),
      isPrimary: emotion.toLowerCase() === primary
    })).sort((a, b) => b.score - a.score);
    
    return {
      predictions,
      primary,
      confidence,
      formattedEmotions,
      annotations: result.annotations || []
    };
  } catch (error) {
    console.error("Error in emotion detection:", error);
    return {
      predictions: { neutral: 1 },
      primary: 'neutral',
      confidence: 1,
      formattedEmotions: [{ emotion: 'neutral', score: 1, isPrimary: true }],
      annotations: []
    };
  }
}

/**
 * Process named entity recognition task with proper error handling
 */
async function processNERTask(text: string) {
  try {
    return await namedEntityRecognition.classify(text);
  } catch (error) {
    console.error("Error in named entity recognition:", error);
    return { entities: [], annotations: [] };
  }
}

/**
 * Get fallback result for a failed task
 */
function getFallbackResult(task: string) {
  switch (task) {
    case 'pos':
      return { tags: [] };
      
    case 'keywords':
      return { keywords: [] };
      
    case 'sentiment':
      return {
        predictions: { Neutral: 0.7, Positive: 0.2, Negative: 0.1 },
        primary: 'neutral',
        strength: 0.3,
        annotations: []
      };
      
    case 'emotion':
      return {
        predictions: { neutral: 1 },
        primary: 'neutral',
        confidence: 1,
        formattedEmotions: [{ emotion: 'neutral', score: 1, isPrimary: true }],
        annotations: []
      };
      
    case 'ner':
      return { entities: [], annotations: [] };
      
    default:
      return {};
  }
}

// Also support GET requests with query parameters
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const text = url.searchParams.get('text');
    const tasksParam = url.searchParams.get('tasks');
    
    if (!text) {
      return NextResponse.json(
        { error: "Text parameter is required" },
        { status: 400 }
      );
    }

    // Parse tasks as comma-separated list or default to "all"
    const tasks = tasksParam ? tasksParam.split(',') : ['all'];
    
    // Create a mock request for the POST handler
    const mockRequest = {
      json: () => Promise.resolve({ text, tasks })
    } as NextRequest;
    
    // Reuse the POST handler
    return POST(mockRequest);
    
  } catch (error) {
    console.error("Error processing NLP GET request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
} 