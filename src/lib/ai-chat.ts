// AI Chat Utility for Gemini API integration
// Updated from OpenRouter to use Google's Gemini API

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  retries?: number;
}

// Enhanced response interface with detailed NLP analysis
interface ChatResponse {
  message: string;
  emotion?: string; // Legacy support
  analysis?: {
    emotion: {
      primary: string;
      confidence: number;
      all?: { emotion: string; score: number; isPrimary: boolean }[];
      predictions?: Record<string, number>;
    };
    sentiment: {
      primary: string;
      strength: number;
      predictions: {
        Positive: number;
        Neutral: number;
        Negative: number;
      };
    };
    keywords: string[];
    entities?: Array<{ text: string; type: string }>;
  };
  userAnalysis?: {
    emotion: {
      primary: string;
      confidence: number;
      predictions: Record<string, number>;
    };
    sentiment: {
      primary: string;
      strength: number;
      predictions: {
        Positive: number;
        Neutral: number;
        Negative: number;
      };
    };
  };
  annotations?: {
    emotion: any[];
    sentiment: any[];
    entities: any[];
  };
  conversationalInsight?: {
    topicsDetected: string[];
    emotionalTone: string;
    responseComplexity: string;
  };
  error?: string;
}

// Default system prompt that guides the AI's behavior
const DEFAULT_SYSTEM_PROMPT = `
You are EmpathAI, an empathetic AI companion designed to help users express themselves freely. 
Your primary goal is to create a safe, judgment-free space for users to share their thoughts and feelings.

Guidelines:
- Be warm, supportive, and understanding in all interactions
- Listen actively and respond with empathy to users' emotions
- Ask thoughtful follow-up questions to encourage self-reflection
- Avoid clinical or robotic language; communicate naturally
- Never judge, criticize, or dismiss users' feelings
- Maintain a supportive tone, even in challenging conversations
- Recognize emotional nuances in users' messages
- Balance compassion with encouraging growth and new perspectives
- Respect privacy and maintain confidentiality
- If users are in crisis, suggest professional mental health resources

Adapt your tone and approach based on the user's emotional state. Your goal is to help them feel heard, 
understood, and supported while fostering their emotional well-being.
`;

// Maximum number of retry attempts for failed API calls
const MAX_RETRIES = 2;

// Delay between retries (ms)
const RETRY_DELAY = 1000;

/**
 * Sleep utility for delay between retries
 * @param ms Milliseconds to sleep
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Send a message to the AI and get a response
 * @param messages Previous conversation messages
 * @param options Chat options (systemPrompt, temperature, etc.)
 * @returns Promise with the AI's response
 */
export async function sendMessage(
  messages: Message[],
  options: ChatOptions = {}
): Promise<ChatResponse> {
  const retries = options.retries !== undefined ? options.retries : MAX_RETRIES;
  
  let lastError: Error | null = null;
  
  // Try the request up to MAX_RETRIES times
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Add a small delay between retry attempts
      if (attempt > 0) {
        await sleep(RETRY_DELAY * attempt);
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          systemPrompt: options.systemPrompt || DEFAULT_SYSTEM_PROMPT,
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      // Even if we get a non-200 response, we should try to parse it
      // as the API is designed to return error details in the response body
      const data = await response.json();
      
      // If the response has an error but returned 200, it's a "friendly" error
      // that we should display to the user
      if (data.error && response.status === 200) {
        return data; // Return the friendly error response from the API
      }
      
      if (!response.ok) {
        throw new Error(data.error || `Server returned ${response.status}`);
      }
      
      return data;
    } catch (error: any) {
      lastError = error;
      
      // Don't retry if it's an abort error (timeout)
      if (error.name === 'AbortError') {
        break;
      }
      
      // Log the error but continue with retries if we have attempts left
      console.error(`API call attempt ${attempt + 1} failed:`, error);
      
      // If this was our last retry, we'll exit the loop and throw
      if (attempt === retries) {
        break;
      }
    }
  }
  
  console.error('All API call attempts failed:', lastError);
  
  // Return a graceful error response that matches the ChatResponse interface
  return {
    message: 'I apologize for the difficulty. I\'m experiencing a temporary issue with my server connection. Please try again in a moment.',
    analysis: {
      emotion: {
        primary: 'concerned',
        confidence: 1.0,
        all: [{ emotion: 'concerned', score: 1.0, isPrimary: true }]
      },
      sentiment: {
        primary: 'neutral',
        strength: 0.5,
        predictions: {
          Positive: 0.2,
          Neutral: 0.7,
          Negative: 0.1
        }
      },
      keywords: ['apologize', 'difficulty', 'temporary'],
      entities: []
    },
    error: lastError?.message || 'Unknown error during API call'
  };
}

/**
 * Format a user message for the API
 * @param content User message content
 * @returns Formatted message object
 */
export function formatUserMessage(content: string): Message {
  return {
    role: 'user',
    content,
  };
}

/**
 * Format an assistant (AI) message for the API
 * @param content AI message content
 * @returns Formatted message object
 */
export function formatAssistantMessage(content: string): Message {
  return {
    role: 'assistant',
    content,
  };
}

/**
 * Create a system message
 * @param content System prompt content
 * @returns Formatted system message
 */
export function formatSystemMessage(content: string): Message {
  return {
    role: 'system',
    content,
  };
} 