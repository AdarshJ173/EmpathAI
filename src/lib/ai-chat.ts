// AI Chat Utility for OpenRouter API integration

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

interface ChatResponse {
  message: string;
  emotion: string;
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
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        systemPrompt: options.systemPrompt || DEFAULT_SYSTEM_PROMPT,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get response from AI');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending message to AI:', error);
    throw error;
  }
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