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

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  emotion?: string;
  apiMessage?: {
    role: 'user' | 'assistant' | 'system';
    content: string;
  };
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
      emotion: "neutral",
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
    if (isRecording && !usesFallbackMode) {
      // Start voice recognition for native mode only
      voiceRecognition?.startListening((transcript) => {
        if (transcript.trim()) {
          setInputValue(transcript);
          // Auto-send the voice message
          handleSendVoiceMessage(transcript);
        }
      });
    } else if (!isRecording) {
      // Stop voice recognition
      voiceRecognition?.stopListening();
    }

    // For fallback mode, we'll focus the input field
    if (isRecording && usesFallbackMode) {
      inputRef.current?.focus();
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
    
    // Create and add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: voiceText,
      sender: "user",
      timestamp: new Date(),
      apiMessage: formatUserMessage(voiceText)
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    
    // Get AI response
    await getAIResponse([...messages, userMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // If in fallback mode and listening, treat this as a voice message
    if (usesFallbackMode && isRecording) {
      onTextInput(inputValue);
      return;
    }

    // Play send sound
    playSendSound();

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
      apiMessage: formatUserMessage(inputValue)
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    
    // Get AI response
    await getAIResponse([...messages, userMessage]);
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
      
      // Play receive sound
      playReceiveSound();
      
      // Create AI message object
      const aiMessageObj: Message = {
        id: Date.now().toString(),
        content: aiResponse.message,
        sender: "ai",
        timestamp: new Date(),
        emotion: aiResponse.emotion,
        apiMessage: formatAssistantMessage(aiResponse.message)
      };

      setMessages((prev) => [...prev, aiMessageObj]);
      
      // Speak the AI response if we were in voice mode
      if (isRecording || isListening) {
        setIsAiSpeaking(true);
        voiceSynthesis?.speak(aiResponse.message, () => {
          setIsAiSpeaking(false);
        });
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: "Sorry, I had trouble responding. Please try again.",
          sender: "ai",
          timestamp: new Date(),
          emotion: "concerned",
          apiMessage: formatAssistantMessage("Sorry, I had trouble responding. Please try again.")
        },
      ]);
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
      onStartListening();
      if (usesFallbackMode) {
        // Focus input field immediately in fallback mode
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    } else {
      onStopListening();
      voiceRecognition?.stopListening();
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
      </Card>
    </div>
  );
};

export default ChatInterface;
