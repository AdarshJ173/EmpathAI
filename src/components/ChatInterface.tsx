"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Mic, Send, X } from "lucide-react";
import VoiceVisualizer from "./VoiceVisualizer";
import MessageDisplay from "./MessageDisplay";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  emotion?: string;
}

interface ChatInterfaceProps {
  onViewHistory?: () => void;
  isListening?: boolean;
  onStartListening?: () => void;
  onStopListening?: () => void;
}

const ChatInterface = ({
  onViewHistory = () => {},
  isListening = false,
  onStartListening = () => {},
  onStopListening = () => {},
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! How are you feeling today?",
      sender: "ai",
      timestamp: new Date(),
      emotion: "neutral",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(isListening);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate AI thinking and response
    setTimeout(() => {
      setIsAiSpeaking(true);

      // Simulate AI response after a delay
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: generateAiResponse(inputValue),
          sender: "ai",
          timestamp: new Date(),
          emotion: detectEmotion(inputValue),
        };

        setMessages((prev) => [...prev, aiResponse]);
        setIsAiSpeaking(false);
      }, 1500);
    }, 500);
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

      // Simulate voice recording and processing
      // Only start the simulation when we're turning recording ON
      setTimeout(() => {
        // Simulate end of recording and processing
        setIsRecording(false);
        onStopListening(); // Make sure we call stop listening when recording ends
        const voiceText = "This is a simulated voice message.";
        setInputValue(voiceText);

        // Auto-send after voice recognition
        setTimeout(() => {
          const userMessage: Message = {
            id: Date.now().toString(),
            content: voiceText,
            sender: "user",
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, userMessage]);
          setInputValue("");

          // Simulate AI response
          setTimeout(() => {
            setIsAiSpeaking(true);
            setTimeout(() => {
              const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                content: generateAiResponse(voiceText),
                sender: "ai",
                timestamp: new Date(),
                emotion: "curious",
              };

              setMessages((prev) => [...prev, aiResponse]);
              setIsAiSpeaking(false);
            }, 1500);
          }, 500);
        }, 500);
      }, 3000);
    } else {
      onStopListening();
    }
  };

  // Simple AI response generator (placeholder)
  const generateAiResponse = (userInput: string): string => {
    const responses = [
      "I understand how you feel. Would you like to talk more about that?",
      "That's interesting. How does that make you feel?",
      "I'm here to listen. Please tell me more.",
      "Thank you for sharing that with me. What else is on your mind?",
      "I'm learning more about you. How has your day been otherwise?",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Simple emotion detection (placeholder)
  const detectEmotion = (text: string): string => {
    const emotions = [
      "neutral",
      "happy",
      "sad",
      "curious",
      "concerned",
      "supportive",
    ];
    return emotions[Math.floor(Math.random() * emotions.length)];
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto bg-background">
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-2xl font-bold">AI Companion</h1>
        <Button variant="outline" onClick={onViewHistory}>
          View History
        </Button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Voice visualizer section */}
        <div className="flex justify-center items-center p-6">
          <VoiceVisualizer
            isActive={isRecording || isAiSpeaking}
            mode={
              isRecording ? "recording" : isAiSpeaking ? "speaking" : "idle"
            }
          />
        </div>

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
          >
            {isRecording ? (
              <X className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>

          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isRecording}
            className="flex-1"
          />

          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isRecording}
            size="icon"
            className="rounded-full"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ChatInterface;
