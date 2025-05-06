"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type MessageType = {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  emotion?: string;
  apiMessage?: {
    role: 'user' | 'assistant' | 'system';
    content: string;
  };
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
    angry: { icon: "😠", label: "Angry", color: "text-red-500" },
    surprised: { icon: "😮", label: "Surprised", color: "text-indigo-500" },
    curious: { icon: "🤔", label: "Curious", color: "text-blue-400" },
    supportive: { icon: "🤗", label: "Supportive", color: "text-emerald-500" },
  };

  const emotionInfo = emotionMap[emotion] || {
    icon: "❓",
    label: emotion.charAt(0).toUpperCase() + emotion.slice(1),
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
  // Default messages if none are provided - should no longer be needed since we have initial messages
  const displayMessages = messages;
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Animation variants for messages
  const messageVariants = {
    hidden: { 
      opacity: 0,
      y: 20,
      scale: 0.9
    },
    visible: { 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 40,
        mass: 1
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className={cn("w-full h-full bg-background flex flex-col", className)}>
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col space-y-4">
          <AnimatePresence initial={false}>
            {displayMessages.map((message) => (
              <motion.div
                key={message.id}
                className={cn(
                  "flex",
                  message.sender === "user" ? "justify-end" : "justify-start",
                )}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={messageVariants}
                layout
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
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </div>
  );
};

export default MessageDisplay;
