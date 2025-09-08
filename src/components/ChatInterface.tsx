"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Mic, Send, X, Keyboard } from "lucide-react";
import MessageDisplay from "./MessageDisplay";
import { voiceRecognition, voiceSynthesis } from "@/lib/voice-recognition";
import { sendMessage, formatUserMessage, formatAssistantMessage } from "@/lib/ai-chat";
import { Loader2 } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  emotion?: string;
  emotionDetails?: {
    primary: string;
    confidence: number;
    all?: { emotion: string; score: number; isPrimary: boolean }[];
  };
  sentiment?: {
    primary: string;
    strength: number;
    predictions: {
      Positive: number;
      Neutral: number;
      Negative: number;
    };
  };
  keywords?: string[];
  entities?: Array<{ text: string; type: string }>;
  apiMessage?: {
    role: 'user' | 'assistant' | 'system';
    content: string;
  };
  isTypingIndicator?: boolean;
}

interface ChatInterfaceProps {
  onViewHistory?: () => void;
  isListening?: boolean;
  onStartListening?: () => void;
  onStopListening?: () => void;
  onTextInput?: (text: string) => void;
  usesFallbackMode?: boolean;
}

const ChatInterface = ({
  onViewHistory = () => {},
  isListening = false,
  onStartListening = () => {},
  onStopListening = () => {},
  onTextInput = () => {},
  usesFallbackMode = false,
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! How are you feeling today?",
      sender: "ai",
      timestamp: new Date(),
      emotion: "supportive",
      emotionDetails: {
        primary: "supportive",
        confidence: 0.9,
        all: [
          { emotion: "supportive", score: 0.8, isPrimary: true },
          { emotion: "curious", score: 0.6, isPrimary: false },
          { emotion: "optimism", score: 0.5, isPrimary: false }
        ]
      },
      sentiment: {
        primary: "positive",
        strength: 0.7,
        predictions: {
          Positive: 0.7,
          Neutral: 0.25,
          Negative: 0.05
        }
      },
      keywords: ["feeling", "today", "hello"],
      apiMessage: {
        role: 'assistant',
        content: "Hello! How are you feeling today?"
      }
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(isListening);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sendAudioRef = useRef<HTMLAudioElement | null>(null);
  const receiveAudioRef = useRef<HTMLAudioElement | null>(null);
  const [typingIndicatorId, setTypingIndicatorId] = useState<string | null>(null);

  // Initialize audio elements
  useEffect(() => {
    sendAudioRef.current = new Audio('/send.mp3');
    receiveAudioRef.current = new Audio('/receive.mp3');
  }, []);

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Sync isRecording with parent's isListening
  useEffect(() => {
    setIsRecording(isListening);
  }, [isListening]);

  // Handle voice recording when isRecording changes
  useEffect(() => {
    if (isRecording) {
      if (usesFallbackMode) {
        // Focus input field for manual typing in fallback mode
        inputRef.current?.focus();
      } else {
        // Start real-time listening with live transcription
        voiceRecognition?.startRealTimeListening(
          // Real-time transcript update
          (transcript) => {
            setInputValue(transcript);
          },
          // Auto-submit when pause detected
          (finalTranscript) => {
            if (finalTranscript.trim()) {
              handleSendVoiceMessage(finalTranscript);
            }
          },
          2000 // 2 second pause threshold
        );
      }
    } else {
      // Stop voice recognition
      if (!usesFallbackMode) {
        voiceRecognition?.stopRealTimeListening();
      }
    }
  }, [isRecording, usesFallbackMode]);

  // Play send sound
  const playSendSound = () => {
    if (sendAudioRef.current) {
      sendAudioRef.current.currentTime = 0;
      sendAudioRef.current.play().catch(err => console.error("Error playing send sound:", err));
    }
  };

  // Play receive sound
  const playReceiveSound = () => {
    if (receiveAudioRef.current) {
      receiveAudioRef.current.currentTime = 0;
      receiveAudioRef.current.play().catch(err => console.error("Error playing receive sound:", err));
    }
  };

  const handleSendVoiceMessage = async (voiceText: string) => {
    // Stop recording when we send the voice message
    setIsRecording(false);
    onStopListening();
    
    // Play send sound
    playSendSound();
    
    // Create a message ID now so we can update it later
    const messageId = Date.now().toString();
    
    // Add user message immediately to show in the UI (with temp analysis placeholder)
    const initialUserMessage: Message = {
      id: messageId,
      content: voiceText,
      sender: "user",
      timestamp: new Date(),
      apiMessage: formatUserMessage(voiceText),
      // Add default neutral emotion placeholder
      emotionDetails: {
        primary: 'neutral',
        confidence: 0.5,
        all: [{ emotion: 'neutral', score: 1.0, isPrimary: true }]
      },
      sentiment: {
        primary: 'neutral',
        strength: 0.5,
        predictions: {
          Positive: 0.33,
          Neutral: 0.34,
          Negative: 0.33
        }
      }
    };

    setMessages((prev) => [...prev, initialUserMessage]);
    setInputValue("");
    
    // Show typing indicator immediately
    const indicatorId = uuidv4();
    setTypingIndicatorId(indicatorId);
    setMessages((prev) => [
      ...prev,
      {
        id: indicatorId,
        content: "...",
        sender: "ai",
        timestamp: new Date(),
        isTypingIndicator: true
      } as Message
    ]);

    // Get AI response
    await getAIResponse([...messages, initialUserMessage]);
    
    // Remove typing indicator after response
    setTypingIndicatorId(null);
    setMessages(prev => prev.filter(m => m.id !== indicatorId));
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // If in fallback mode and listening, simulate real-time input
    if (usesFallbackMode && isRecording) {
      voiceRecognition?.simulateRealTimeInput(inputValue);
      return;
    }

    // Play send sound
    playSendSound();

    // Create a message ID now so we can update it later
    const messageId = Date.now().toString();
    
    // Add user message immediately to show in the UI (with temp analysis placeholder)
    const initialUserMessage: Message = {
      id: messageId,
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
      apiMessage: formatUserMessage(inputValue),
      // Add default neutral emotion placeholder
      emotionDetails: {
        primary: 'neutral',
        confidence: 0.5,
        all: [{ emotion: 'neutral', score: 1.0, isPrimary: true }]
      },
      sentiment: {
        primary: 'neutral',
        strength: 0.5,
        predictions: {
          Positive: 0.33,
          Neutral: 0.34,
          Negative: 0.33
        }
      }
    };

    setMessages((prev) => [...prev, initialUserMessage]);
    setInputValue("");
    
    // Show typing indicator immediately
    const indicatorId = uuidv4();
    setTypingIndicatorId(indicatorId);
    setMessages((prev) => [
      ...prev,
      {
        id: indicatorId,
        content: "...",
        sender: "ai",
        timestamp: new Date(),
        isTypingIndicator: true
      } as Message
    ]);

    // Get AI response
    await getAIResponse([...messages, initialUserMessage]);
    
    // Remove typing indicator after response
    setTypingIndicatorId(null);
    setMessages(prev => prev.filter(m => m.id !== indicatorId));
  };

  const getAIResponse = async (messageHistory: Message[]) => {
    setIsLoading(true);
    
    try {
      // Extract API messages from the message history
      const apiMessages = messageHistory
        .filter(m => m.apiMessage)
        .map(m => m.apiMessage!);
      
      // Send to AI API
      const aiResponse = await sendMessage(apiMessages);
      
      // Check if the response contains an error
      if (aiResponse.error) {
        console.warn("AI API returned an error:", aiResponse.error);
        
        // The sendMessage function now returns a properly formatted error response
        // with appropriate message and analysis data
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            content: aiResponse.message,
            sender: "ai",
            timestamp: new Date(),
            emotion: aiResponse.analysis?.emotion?.primary || "concerned",
            emotionDetails: aiResponse.analysis?.emotion,
            sentiment: aiResponse.analysis?.sentiment,
            keywords: aiResponse.analysis?.keywords || ["error", "temporary", "issue"],
            apiMessage: formatAssistantMessage(aiResponse.message)
          },
        ]);
        
        return;
      }
      
      // Play receive sound
      playReceiveSound();
      
      // Create AI message object with enhanced NLP information
      const aiMessageObj: Message = {
        id: Date.now().toString(),
        content: aiResponse.message,
        sender: "ai",
        timestamp: new Date(),
        // Basic emotion for backward compatibility
        emotion: aiResponse.analysis?.emotion?.primary || aiResponse.emotion,
        // Enhanced NLP data
        emotionDetails: aiResponse.analysis?.emotion,
        sentiment: aiResponse.analysis?.sentiment,
        keywords: aiResponse.analysis?.keywords,
        entities: aiResponse.analysis?.entities,
        apiMessage: formatAssistantMessage(aiResponse.message)
      };

      setMessages((prev) => [...prev, aiMessageObj]);
      
      // Speak the AI response using native Speech Synthesis
      setIsAiSpeaking(true);
      if (voiceSynthesis?.speakPriority) {
        voiceSynthesis.speakPriority(aiResponse.message, () => {
          setIsAiSpeaking(false);
          // Automatically start listening again for continuous conversation in voice mode
          if ((isRecording || isListening) && !usesFallbackMode) {
            setTimeout(() => {
              onStartListening();
            }, 500); // Small delay before listening again
          }
        });
      } else {
        setIsAiSpeaking(false);
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      
        // Add error message with more informative content
        const errorMessage: Message = {
          id: Date.now().toString(),
          content: "I apologize for the difficulty. I'm experiencing a temporary issue with my connection. Please try again in a moment or check your internet connection.",
          sender: "ai" as "ai",
          timestamp: new Date(),
          emotion: "concerned",
          emotionDetails: {
            primary: "concerned",
            confidence: 1.0,
            all: [
              { emotion: "concerned", score: 0.9, isPrimary: true },
              { emotion: "supportive", score: 0.5, isPrimary: false }
            ]
          },
          sentiment: {
            primary: "neutral",
            strength: 0.5,
            predictions: {
              Positive: 0.3,
              Neutral: 0.6,
              Negative: 0.1
            }
          },
          keywords: ["apologize", "difficulty", "temporary", "issue", "try", "again"],
          apiMessage: formatAssistantMessage("I apologize for the difficulty. I'm experiencing a temporary issue with my connection. Please try again in a moment or check your internet connection.")
        };
        
        setMessages((prev) => [...prev, errorMessage]);
        
        // Speak error message using native Speech Synthesis
        setIsAiSpeaking(true);
        voiceSynthesis?.speak(errorMessage.content, () => {
          setIsAiSpeaking(false);
        }, undefined, true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    const newState = !isRecording;
    setIsRecording(newState);

    if (newState) {
      // Start real-time listening with auto-submission in chat interface
      if (voiceRecognition && !voiceRecognition.isFallbackMode()) {
        voiceRecognition.startRealTimeListening(
          // Real-time transcript update - show live text in input field
          (transcript) => {
            setInputValue(transcript);
          },
          // Auto-submit when natural pause detected
          async (finalTranscript) => {
            if (finalTranscript.trim()) {
              setInputValue(finalTranscript);
              // Automatically send the message
              setTimeout(() => {
                handleSendMessage();
              }, 100);
            }
          },
          2000 // 2 second pause threshold
        );
      }
      
      onStartListening();
      if (usesFallbackMode) {
        // Focus input field immediately in fallback mode
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    } else {
      onStopListening();
      voiceRecognition?.stopRealTimeListening();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-background">
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Messages section */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <MessageDisplay messages={messages} />
          <div ref={messageEndRef} />
        </div>
      </div>

      {/* Input section */}
      <Card className="p-4 m-4 border shadow-sm">
        <div className="flex items-center gap-2">
          <Button
            variant={isRecording ? "destructive" : "outline"}
            size="icon"
            onClick={toggleRecording}
            className="rounded-full"
            disabled={isLoading || isAiSpeaking}
          >
            {isRecording ? (
              <X className="h-5 w-5" />
            ) : (
              usesFallbackMode ? <Keyboard className="h-5 w-5" /> : <Mic className="h-5 w-5" />
            )}
          </Button>

          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isRecording && usesFallbackMode ? "Type your voice message..." : "Type your message..."}
            disabled={isRecording && !usesFallbackMode || isLoading || isAiSpeaking}
            className={`flex-1 ${isRecording && usesFallbackMode ? 'border-primary' : ''}`}
          />

          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || (isRecording && !usesFallbackMode) || isLoading || isAiSpeaking}
            size="icon"
            className="rounded-full"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        
        {/* Voice mode status indicator */}
        {isRecording && usesFallbackMode && (
          <div className="mt-2 text-xs text-center text-primary animate-pulse">
            <Keyboard className="h-3 w-3 inline mr-1" />
            Voice input active - type your message and press Enter
          </div>
        )}
        
        {/* AI speaking indicator */}
        {isAiSpeaking && (
          <div className="mt-3 flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-lg border border-red-500/20">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
            <span className="text-sm font-medium text-red-500">AI is speaking</span>
            <span className="text-xs text-red-400/80 italic">(click orb to interrupt)</span>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ChatInterface;
