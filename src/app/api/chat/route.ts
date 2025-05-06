import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_KEY = "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";
const MODEL = "qwen/qwen-2.5-72b-instruct:free";

export async function POST(request: NextRequest) {
  try {
    const { messages, systemPrompt } = await request.json();

    // Create API request
    const apiMessages = systemPrompt 
      ? [{ role: "system", content: systemPrompt }, ...messages]
      : messages;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://empathAI.com", // Replace with your actual site URL
        "X-Title": "EmpathAI", // Your app name
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: "API request failed", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Format the AI's response
    return NextResponse.json({
      message: data.choices[0].message.content,
      emotion: detectEmotion(data.choices[0].message.content)
    });
  } catch (error) {
    console.error("Error in chat API route:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

// Function to detect emotion from text (simple implementation)
function detectEmotion(text: string): string {
  const emotions = {
    happy: ["happy", "joy", "delighted", "excited", "pleased", "glad", "cheerful", "smile"],
    sad: ["sad", "unhappy", "depressed", "melancholy", "gloomy", "disappointed", "sorry"],
    angry: ["angry", "mad", "frustrated", "annoyed", "irritated", "upset", "furious"],
    surprised: ["surprised", "shocked", "amazed", "astonished", "stunned"],
    concerned: ["concerned", "worried", "anxious", "troubled", "uneasy", "nervous"],
    neutral: ["neutral", "calm", "balanced", "composed", "collected"],
    curious: ["curious", "interested", "intrigued", "fascinated"],
    supportive: ["supportive", "understanding", "helpful", "empathetic", "sympathetic"]
  };

  const lowercaseText = text.toLowerCase();
  
  // Find the emotion with the most matches
  let bestMatch = "neutral";
  let highestCount = 0;
  
  for (const [emotion, keywords] of Object.entries(emotions)) {
    const count = keywords.reduce((total, keyword) => {
      return total + (lowercaseText.includes(keyword) ? 1 : 0);
    }, 0);
    
    if (count > highestCount) {
      highestCount = count;
      bestMatch = emotion;
    }
  }
  
  return bestMatch;
} 