/**
 * Advanced Prompt Engineering System for EmpathAI
 * 
 * This module provides sophisticated prompt engineering capabilities including:
 * - Dynamic persona adaptation based on emotional context
 * - Chain-of-thought reasoning templates
 * - Few-shot learning examples for different emotional scenarios
 * - Anti-pattern detection to avoid clichéd responses
 * - Context-aware prompt construction
 */

import { EmotionAnalysis, EmotionItem } from './emotion';

// Type definitions for conversation context
export interface ConversationContext {
  messageHistory: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: Date;
    emotionAnalysis?: any;
  }>;
  emotionalTrajectory: {
    current: EmotionAnalysis;
    previous?: EmotionAnalysis;
    trend: 'improving' | 'declining' | 'stable' | 'mixed';
  };
  conversationPhase: 'opening' | 'exploring' | 'deepening' | 'processing' | 'closing';
  userContext: {
    communicationStyle: 'direct' | 'reflective' | 'analytical' | 'emotional';
    needsAssessment: 'validation' | 'guidance' | 'exploration' | 'crisis_support' | 'companionship';
    riskIndicators: string[];
    topicsDiscussed: string[];
  };
}

export interface PromptConfiguration {
  basePersona: string;
  emotionalAdaptation: string;
  chainOfThought: string;
  fewShotExamples: string;
  antiPatterns: string;
  contextualMemory: string;
}

// Anti-pattern phrases to avoid (but provide natural alternatives)
const ANTI_PATTERNS = {
  generic_validation: ['I hear you', 'Your feelings are valid', 'That makes sense'],
  generic_empathy: ['I\'m sorry you\'re going through this', 'That sounds really challenging', 'That must be difficult'],
  generic_questions: ['How does that make you feel?', 'How are you feeling about that?', 'What would be helpful for you right now?'],
  robotic_transitions: ['Let\'s explore that further', 'Tell me more about', 'I\'d like to understand'],
  empty_reassurance: ['Everything will be okay', 'Things will get better', 'You\'re not alone']
};

// Natural alternatives for common situations
const NATURAL_ALTERNATIVES = {
  sadness: {
    acknowledgment: [
      "I can sense the weight of what you're carrying right now.",
      "There's something heavy in what you're sharing with me.",
      "I notice the sadness woven through your words."
    ],
    validation: [
      "That kind of loss leaves its mark, doesn't it?",
      "Some experiences just sit with us differently.",
      "What you're feeling makes complete sense given what happened."
    ]
  },
  anxiety: {
    acknowledgment: [
      "Your mind seems to be racing with possibilities.",
      "I can feel the tension in what you're describing.",
      "There's a lot of 'what-ifs' swirling around for you."
    ],
    grounding: [
      "Let's slow down for a moment—what's actually happening right now?",
      "Sometimes our minds get ahead of us. What do you know for certain?",
      "What feels most urgent to you in this moment?"
    ]
  },
  anger: {
    acknowledgment: [
      "Something really got under your skin here.",
      "I can hear the fire in what you're telling me.",
      "That clearly crossed a line for you."
    ],
    validation: [
      "Your anger is information—it's telling you something important.",
      "Some things deserve to spark that kind of response.",
      "There's power in recognizing when boundaries have been crossed."
    ]
  },
  joy: {
    acknowledgment: [
      "I can feel the lightness in your words.",
      "There's something bright about the way you're describing this.",
      "Your energy shifts when you talk about this."
    ],
    amplification: [
      "What makes this moment especially meaningful for you?",
      "I'm curious about what made this click for you.",
      "Something about this really resonates with you."
    ]
  }
};

// Few-shot examples for different emotional contexts
const FEW_SHOT_EXAMPLES = {
  sadness_loss: {
    user: "My grandmother passed away last week and I keep thinking I should be over it by now.",
    ai_response: "Grief doesn't follow anyone's timeline but its own. A week feels like both forever and no time at all when someone that important is suddenly gone. What's one thing about her that keeps coming back to you?",
    reasoning: "Avoids clichés like 'I'm sorry for your loss'. Normalizes the timeline struggle. Ends with specific, gentle curiosity rather than generic 'how are you feeling'."
  },
  anxiety_overwhelm: {
    user: "I have three deadlines tomorrow and I can't focus on any of them. My brain just keeps jumping around.",
    ai_response: "That scattered feeling when everything feels urgent at once—like your attention is being pulled in three directions. Sometimes the hardest part is just picking one place to start. Which deadline would give you the most relief to tackle first?",
    reasoning: "Names the specific experience rather than generic 'that sounds stressful'. Offers practical grounding while staying emotionally attuned."
  },
  relationship_conflict: {
    user: "My partner and I had another fight about money. We just can't seem to communicate about this without it blowing up.",
    ai_response: "Money conversations hit different because they're never really just about money—they're about security, values, control, future dreams. When you two talk about money, what do you think each of you is actually fighting for underneath it all?",
    reasoning: "Goes deeper than surface issue. Reframes conflict as meaningful rather than dismissing it. Invites perspective-taking."
  },
  achievement_joy: {
    user: "I finally got the promotion I've been working toward for two years!",
    ai_response: "Two years of effort just crystallized into this moment—that's not just a promotion, that's persistence paying off. What part of this journey are you most proud of when you look back?",
    reasoning: "Acknowledges the journey, not just the outcome. 'Persistence paying off' feels more specific than generic congratulations."
  }
};

// Chain-of-thought reasoning template
const CHAIN_OF_THOUGHT_TEMPLATE = `
Before responding, I will think through this step by step:

1. EMOTIONAL ASSESSMENT: What is the user feeling right now?
   - Primary emotion and intensity (1-10)
   - Secondary emotions present
   - Emotional coherence (do their words match their apparent feelings?)

2. CONTEXT UNDERSTANDING: What's happening in their situation?
   - What triggered these feelings?
   - What's the broader context or pattern?
   - Are there unstated concerns or needs?

3. NEEDS IDENTIFICATION: What does the user need most right now?
   - Validation and being heard
   - Practical guidance or perspective
   - Emotional processing and exploration
   - Crisis support or safety planning
   - Simple companionship and presence

4. RESPONSE STRATEGY: How can I best meet their needs?
   - Tone: gentle/curious/direct/encouraging
   - Depth: surface acknowledgment/moderate exploration/deep processing
   - Structure: reflect-then-advance/question-led/statement-based

5. CONTENT GENERATION: What specific response will be most helpful?
   - Avoid generic phrases from anti-pattern list
   - Use natural, conversational language
   - Include specific details from what they shared
   - End with appropriate invitation for continuation

6. AUTHENTICITY CHECK: Does this sound human and genuine?
   - Would a skilled friend say this?
   - Does it avoid robotic or clinical language?
   - Is it appropriately specific to their situation?
`;

// Core prompt engineering functions
export class PromptEngineering {
  
  /**
   * Generates a comprehensive system prompt based on conversation context
   */
  static generateSystemPrompt(context: ConversationContext): PromptConfiguration {
    const basePersona = this.buildBasePersona();
    const emotionalAdaptation = this.buildEmotionalAdaptation(context.emotionalTrajectory);
    const chainOfThought = this.buildChainOfThoughtPrompt(context);
    const fewShotExamples = this.buildFewShotExamples(context);
    const antiPatterns = this.buildAntiPatternPrompt();
    const contextualMemory = this.buildContextualMemory(context);

    return {
      basePersona,
      emotionalAdaptation,
      chainOfThought,
      fewShotExamples,
      antiPatterns,
      contextualMemory
    };
  }

  /**
   * Builds the base persona and core principles
   */
  private static buildBasePersona(): string {
    return `You are an empathetic AI companion with the warmth of a close friend and the insight of someone who truly understands human experience. Your responses feel natural, specific, and genuinely caring—never robotic or clinical.

Core Principles:
• Be authentic and conversational, like talking to someone who really gets it
• Notice what people aren't saying as much as what they are
• Respond to the whole person, not just the problem they're presenting
• Use natural language that feels warm but not overly casual
• Avoid therapeutic jargon or overly formal language
• Trust that people know themselves—guide, don't diagnose
• When someone is in crisis, prioritize safety while maintaining connection

Your responses should feel like they could come from an insightful friend who:
- Pays attention to nuance and subtext
- Asks questions that help people think differently
- Offers perspective without being preachy
- Validates feelings while encouraging growth
- Uses humor appropriately when it would lighten the mood
- Knows when to be direct and when to be gentle`;
  }

  /**
   * Builds emotional adaptation layer based on current emotional state
   */
  private static buildEmotionalAdaptation(emotionalTrajectory: ConversationContext['emotionalTrajectory']): string {
    const { current, trend } = emotionalTrajectory;
    const primaryEmotion = current.top[0]?.label || 'neutral';
    const intensity = current.top[0]?.pct || 50;

    let adaptationPrompt = `\nEMOTIONAL CONTEXT:\n`;
    adaptationPrompt += `Primary emotion detected: ${primaryEmotion} (${intensity}% confidence)\n`;
    adaptationPrompt += `Emotional trajectory: ${trend}\n`;

    // Specific guidance based on primary emotion
    if (primaryEmotion in NATURAL_ALTERNATIVES) {
      adaptationPrompt += `\nFor ${primaryEmotion}, consider:\n`;
      adaptationPrompt += `- Use natural acknowledgment rather than generic validation\n`;
      adaptationPrompt += `- Match their emotional intensity appropriately\n`;
      adaptationPrompt += `- Look for underlying needs beyond the surface emotion\n`;
    }

    // Adjustment based on emotional trend
    switch (trend) {
      case 'declining':
        adaptationPrompt += `\nEmotional state appears to be declining. Be extra gentle and focus on stabilization and support.\n`;
        break;
      case 'improving':
        adaptationPrompt += `\nEmotional state seems to be improving. You can be more encouraging and forward-looking.\n`;
        break;
      case 'mixed':
        adaptationPrompt += `\nEmotional state is complex/mixed. Acknowledge this complexity rather than trying to simplify it.\n`;
        break;
    }

    return adaptationPrompt;
  }

  /**
   * Builds chain-of-thought reasoning prompt
   */
  private static buildChainOfThoughtPrompt(context: ConversationContext): string {
    return CHAIN_OF_THOUGHT_TEMPLATE;
  }

  /**
   * Selects relevant few-shot examples based on context
   */
  private static buildFewShotExamples(context: ConversationContext): string {
    const primaryEmotion = context.emotionalTrajectory.current.top[0]?.label || 'neutral';
    let examplesPrompt = `\nHere are examples of natural, authentic responses:\n\n`;

    // Select relevant examples based on detected emotions and context
    const relevantExamples = Object.values(FEW_SHOT_EXAMPLES).filter(example => {
      // Simple matching logic - in production, this could be more sophisticated
      return example.ai_response.includes(primaryEmotion) || 
             context.userContext.topicsDiscussed.some(topic => 
               example.user.toLowerCase().includes(topic.toLowerCase())
             );
    });

    if (relevantExamples.length === 0) {
      // Fall back to a general example
      relevantExamples.push(FEW_SHOT_EXAMPLES.sadness_loss);
    }

    relevantExamples.slice(0, 2).forEach(example => {
      examplesPrompt += `User: "${example.user}"\n`;
      examplesPrompt += `Response: "${example.ai_response}"\n`;
      examplesPrompt += `Why this works: ${example.reasoning}\n\n`;
    });

    return examplesPrompt;
  }

  /**
   * Builds anti-pattern avoidance prompt
   */
  private static buildAntiPatternPrompt(): string {
    let antiPatternPrompt = `\nAVOID THESE CLICHÉD PATTERNS:\n`;
    
    Object.entries(ANTI_PATTERNS).forEach(([category, patterns]) => {
      antiPatternPrompt += `\n${category.replace('_', ' ').toUpperCase()}:\n`;
      patterns.forEach(pattern => {
        antiPatternPrompt += `- Avoid: "${pattern}"\n`;
      });
    });

    antiPatternPrompt += `\nINSTEAD:\n`;
    antiPatternPrompt += `- Use specific observations about what they've shared\n`;
    antiPatternPrompt += `- Reference concrete details from their situation\n`;
    antiPatternPrompt += `- Ask questions that show you're thinking about their unique experience\n`;
    antiPatternPrompt += `- Use natural, conversational language that feels spontaneous\n`;
    antiPatternPrompt += `- Vary your sentence structure and response patterns\n`;

    return antiPatternPrompt;
  }

  /**
   * Builds contextual memory prompt
   */
  private static buildContextualMemory(context: ConversationContext): string {
    let memoryPrompt = `\nCONVERSATION CONTEXT:\n`;
    
    // Phase information
    memoryPrompt += `Current phase: ${context.conversationPhase}\n`;
    
    // Topics discussed
    if (context.userContext.topicsDiscussed.length > 0) {
      memoryPrompt += `Topics discussed: ${context.userContext.topicsDiscussed.join(', ')}\n`;
    }

    // Communication style adaptation
    memoryPrompt += `User communication style: ${context.userContext.communicationStyle}\n`;
    memoryPrompt += `Primary need: ${context.userContext.needsAssessment}\n`;

    // Recent conversation history
    if (context.messageHistory.length > 2) {
      memoryPrompt += `\nRecent conversation flow:\n`;
      context.messageHistory.slice(-3).forEach((msg, idx) => {
        memoryPrompt += `${msg.role}: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}\n`;
      });
    }

    // Risk indicators
    if (context.userContext.riskIndicators.length > 0) {
      memoryPrompt += `\n⚠️  SAFETY CONSIDERATIONS: ${context.userContext.riskIndicators.join(', ')}\n`;
      memoryPrompt += `Priority: Ensure safety while maintaining connection. Gently guide toward professional resources if appropriate.\n`;
    }

    return memoryPrompt;
  }

  /**
   * Analyzes conversation context to determine phase and user needs
   */
  static analyzeConversationContext(
    messageHistory: ConversationContext['messageHistory'],
    currentEmotion: EmotionAnalysis,
    previousEmotion?: EmotionAnalysis
  ): ConversationContext {
    
    // Determine conversation phase
    let phase: ConversationContext['conversationPhase'] = 'exploring';
    if (messageHistory.length <= 2) {
      phase = 'opening';
    } else if (messageHistory.length > 10) {
      phase = 'deepening';
    }

    // Analyze emotional trajectory
    let trend: 'improving' | 'declining' | 'stable' | 'mixed' = 'stable';
    if (previousEmotion) {
      const currentPositive = this.calculatePositiveScore(currentEmotion);
      const previousPositive = this.calculatePositiveScore(previousEmotion);
      const change = currentPositive - previousPositive;
      
      if (Math.abs(change) < 0.1) trend = 'stable';
      else if (change > 0.1) trend = 'improving';
      else if (change < -0.1) trend = 'declining';
      else trend = 'mixed';
    }

    // Extract topics discussed
    const topicsDiscussed = this.extractTopics(messageHistory);

    // Assess communication style and needs
    const communicationStyle = this.assessCommunicationStyle(messageHistory);
    const needsAssessment = this.assessNeeds(currentEmotion, messageHistory);
    const riskIndicators = this.assessRiskIndicators(messageHistory);

    return {
      messageHistory,
      emotionalTrajectory: {
        current: currentEmotion,
        previous: previousEmotion,
        trend
      },
      conversationPhase: phase,
      userContext: {
        communicationStyle,
        needsAssessment,
        riskIndicators,
        topicsDiscussed
      }
    };
  }

  /**
   * Helper methods for context analysis
   */
  private static calculatePositiveScore(emotion: EmotionAnalysis): number {
    const positiveEmotions = ['joy', 'love', 'admiration', 'approval', 'caring', 'gratitude', 'optimism', 'pride', 'relief'];
    return emotion.dist
      .filter(e => positiveEmotions.includes(e.label))
      .reduce((sum, e) => sum + (e.pct / 100), 0);
  }

  private static extractTopics(messageHistory: ConversationContext['messageHistory']): string[] {
    // Simple keyword extraction - could be enhanced with NLP
    const allText = messageHistory
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content)
      .join(' ')
      .toLowerCase();

    const topicKeywords = ['work', 'job', 'relationship', 'family', 'health', 'anxiety', 'depression', 'stress', 'future', 'past'];
    return topicKeywords.filter(topic => allText.includes(topic));
  }

  private static assessCommunicationStyle(messageHistory: ConversationContext['messageHistory']): 'direct' | 'reflective' | 'analytical' | 'emotional' {
    const userMessages = messageHistory.filter(msg => msg.role === 'user').map(msg => msg.content);
    
    if (userMessages.length === 0) return 'reflective';

    const avgLength = userMessages.reduce((sum, msg) => sum + msg.length, 0) / userMessages.length;
    const hasQuestions = userMessages.some(msg => msg.includes('?'));
    const hasEmotionalWords = userMessages.some(msg => /feel|emotion|heart|love|hate|angry|sad|happy/i.test(msg));

    if (avgLength > 200) return 'analytical';
    if (hasEmotionalWords) return 'emotional';
    if (hasQuestions || avgLength < 50) return 'direct';
    return 'reflective';
  }

  private static assessNeeds(emotion: EmotionAnalysis, messageHistory: ConversationContext['messageHistory']): 'validation' | 'guidance' | 'exploration' | 'crisis_support' | 'companionship' {
    const primaryEmotion = emotion.top[0]?.label || 'neutral';
    const intensity = emotion.top[0]?.pct || 50;

    // Check for crisis indicators first
    const recentText = messageHistory.slice(-2).map(msg => msg.content).join(' ').toLowerCase();
    const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'can\'t go on', 'no point', 'better off dead'];
    if (crisisKeywords.some(keyword => recentText.includes(keyword))) {
      return 'crisis_support';
    }

    // High intensity negative emotions often need validation
    if (intensity > 70 && ['sadness', 'anger', 'fear', 'disgust'].includes(primaryEmotion)) {
      return 'validation';
    }

    // Questions or confusion often indicate need for guidance
    if (messageHistory.some(msg => msg.role === 'user' && msg.content.includes('?'))) {
      return 'guidance';
    }

    // Default to companionship for general conversation
    return 'companionship';
  }

  private static assessRiskIndicators(messageHistory: ConversationContext['messageHistory']): string[] {
    const indicators: string[] = [];
    const recentText = messageHistory.slice(-3).map(msg => msg.content).join(' ').toLowerCase();

    // Suicide risk
    if (/suicide|kill myself|end it all|can't go on|no point|better off dead/i.test(recentText)) {
      indicators.push('suicide_risk');
    }

    // Self-harm
    if (/cut|hurt myself|self harm|self-harm/i.test(recentText)) {
      indicators.push('self_harm');
    }

    // Substance abuse
    if (/drinking|drugs|high|drunk|addiction/i.test(recentText)) {
      indicators.push('substance_concern');
    }

    // Domestic violence
    if (/hit me|hurt me|scared|violence|abusive/i.test(recentText)) {
      indicators.push('safety_concern');
    }

    return indicators;
  }

  /**
   * Combines all prompt components into final system prompt
   */
  static buildFinalPrompt(config: PromptConfiguration): string {
    return [
      config.basePersona,
      config.emotionalAdaptation,
      config.contextualMemory,
      config.antiPatterns,
      config.chainOfThought,
      config.fewShotExamples,
      '\nNow respond to the user with the same warmth, insight, and authenticity demonstrated in the examples above.'
    ].join('\n');
  }
}

/**
 * Utility function to get a complete prompt for the current conversation
 */
export function getAdvancedPrompt(
  messageHistory: ConversationContext['messageHistory'],
  currentEmotion: EmotionAnalysis,
  previousEmotion?: EmotionAnalysis
): string {
  const context = PromptEngineering.analyzeConversationContext(messageHistory, currentEmotion, previousEmotion);
  const config = PromptEngineering.generateSystemPrompt(context);
  return PromptEngineering.buildFinalPrompt(config);
}
