"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";

type MessageType = {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  emotion?: string; // Allow any emotion string to match the parent component's implementation
};

type MessageDisplayProps = {
  messages?: MessageType[];
  className?: string;
};

const EmotionIndicator = ({ emotion }: { emotion?: string }) => {
  if (!emotion) return null;

  const emotionMap: Record<
    string,
    { icon: string; label: string; color: string }
  > = {
    happy: { icon: "😊", label: "Happy", color: "text-green-500" },
    sad: { icon: "😔", label: "Sad", color: "text-blue-500" },
    neutral: { icon: "😐", label: "Neutral", color: "text-gray-500" },
    excited: { icon: "😃", label: "Excited", color: "text-yellow-500" },
    concerned: { icon: "😟", label: "Concerned", color: "text-purple-500" },
  };

  const emotionInfo = emotionMap[emotion] || {
    icon: "❓",
    label: emotion,
    color: "text-gray-500",
  };

  return (
    <div className={`flex items-center gap-1 text-xs ${emotionInfo.color}`}>
      <span>{emotionInfo.icon}</span>
      <span>{emotionInfo.label}</span>
    </div>
  );
};

const MessageDisplay = ({ messages = [], className }: MessageDisplayProps) => {
  // Default messages if none are provided
  const defaultMessages: MessageType[] = [
    {
      id: "1",
      content: "Hello! How are you feeling today?",
      sender: "ai",
      timestamp: new Date(Date.now() - 60000 * 5),
      emotion: "neutral",
    },
    {
      id: "2",
      content: "I'm feeling a bit stressed with work, but otherwise okay.",
      sender: "user",
      timestamp: new Date(Date.now() - 60000 * 4),
    },
    {
      id: "3",
      content:
        "I understand that work stress can be challenging. Would you like to talk about what's causing you stress?",
      sender: "ai",
      timestamp: new Date(Date.now() - 60000 * 3),
      emotion: "concerned",
    },
    {
      id: "4",
      content:
        "I have a big project due next week and I'm not sure if I'll finish it on time.",
      sender: "user",
      timestamp: new Date(Date.now() - 60000 * 2),
    },
    {
      id: "5",
      content:
        "That sounds challenging. Breaking the project into smaller tasks might help make it more manageable. Would you like to discuss some strategies for time management?",
      sender: "ai",
      timestamp: new Date(Date.now() - 60000),
      emotion: "helpful",
    },
  ];

  const displayMessages = messages.length > 0 ? messages : defaultMessages;
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className={cn("w-full h-full bg-background flex flex-col", className)}>
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col space-y-4">
          {displayMessages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.sender === "user" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-lg p-4",
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground ml-12"
                    : "bg-muted mr-12",
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  {message.sender === "ai" && (
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src="https://api.dicebear.com/7.x/bottts/svg?seed=companion"
                        alt="AI"
                      />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex justify-between w-full text-xs text-muted-foreground">
                    <span>
                      {message.sender === "user" ? "You" : "AI Companion"}
                    </span>
                    <span>{formatTime(message.timestamp)}</span>
                  </div>
                  {message.sender === "user" && (
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=user"
                        alt="User"
                      />
                      <AvatarFallback>You</AvatarFallback>
                    </Avatar>
                  )}
                </div>
                <div className="mt-1">{message.content}</div>
                {message.sender === "ai" && message.emotion && (
                  <div className="mt-2">
                    <EmotionIndicator emotion={message.emotion} />
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </div>
  );
};

export default MessageDisplay;
