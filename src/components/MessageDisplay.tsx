"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

type MessageType = {
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
  apiMessage?: {
    role: 'user' | 'assistant' | 'system';
    content: string;
  };
  isTypingIndicator?: boolean;
};

type MessageDisplayProps = {
  messages?: MessageType[];
  className?: string;
};

const EmotionIndicator = ({ 
  emotion, 
  emotionDetails, 
  sentiment,
  isUserMessage = false
}: { 
  emotion?: string; 
  emotionDetails?: MessageType['emotionDetails'];
  sentiment?: MessageType['sentiment'];
  isUserMessage?: boolean;
}) => {
  // If we have detailed emotion info, use that instead of just the emotion string
  const primaryEmotion = emotionDetails?.primary || emotion || "neutral";
  const confidenceScore = emotionDetails?.confidence || 0;
  
  const emotionMap: Record<
    string,
    { icon: string; label: string; color: string; userColor: string }
  > = {
    // Basic emotions
    joy: { icon: "😊", label: "Joy", color: "text-yellow-300", userColor: "text-yellow-300" },
    sadness: { icon: "😔", label: "Sadness", color: "text-blue-300", userColor: "text-blue-300" },
    neutral: { icon: "😐", label: "Neutral", color: "text-gray-300", userColor: "text-gray-300" },
    anger: { icon: "😠", label: "Anger", color: "text-red-300", userColor: "text-red-300" },
    fear: { icon: "😨", label: "Fear", color: "text-purple-300", userColor: "text-purple-300" },
    surprise: { icon: "😮", label: "Surprise", color: "text-indigo-300", userColor: "text-indigo-300" },
    
    // Extra emotions for better coverage
    optimism: { icon: "😃", label: "Optimism", color: "text-green-300", userColor: "text-green-300" },
    love: { icon: "❤️", label: "Love", color: "text-pink-300", userColor: "text-pink-300" },
    happy: { icon: "😄", label: "Happy", color: "text-yellow-300", userColor: "text-yellow-300" },
    sad: { icon: "😢", label: "Sad", color: "text-blue-300", userColor: "text-blue-300" },
    excited: { icon: "🤩", label: "Excited", color: "text-yellow-300", userColor: "text-yellow-300" },
    concerned: { icon: "😟", label: "Concerned", color: "text-purple-300", userColor: "text-purple-300" },
    angry: { icon: "😡", label: "Angry", color: "text-red-300", userColor: "text-red-300" },
    surprised: { icon: "😲", label: "Surprised", color: "text-indigo-300", userColor: "text-indigo-300" },
    curious: { icon: "🤔", label: "Curious", color: "text-blue-300", userColor: "text-blue-300" },
    supportive: { icon: "🤗", label: "Supportive", color: "text-emerald-300", userColor: "text-emerald-300" },
  };

  const emotionInfo = emotionMap[primaryEmotion] || {
    icon: "❓",
    label: primaryEmotion.charAt(0).toUpperCase() + primaryEmotion.slice(1),
    color: "text-gray-300",
    userColor: "text-gray-300"
  };

  // Select color based on whether this is a user message
  const emotionColor = isUserMessage ? emotionInfo.userColor : emotionInfo.color;

  // Determine sentiment icon and color
  let sentimentIcon = "😐";
  let sentimentColor = isUserMessage ? "text-gray-300" : "text-gray-300";
  
  if (sentiment) {
    if (sentiment.primary === "positive") {
      sentimentIcon = sentiment.strength > 0.5 ? "😁" : "🙂";
      sentimentColor = isUserMessage ? "text-green-300" : "text-green-300";
    } else if (sentiment.primary === "negative") {
      sentimentIcon = sentiment.strength > 0.5 ? "😞" : "🙁";
      sentimentColor = isUserMessage ? "text-red-300" : "text-red-300";
    }
  }

  // If we have detailed emotion information, show it in a tooltip
  if (emotionDetails?.all && emotionDetails.all.length > 0) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex items-center gap-3 text-xs mt-2 px-2 py-1 rounded-full ${isUserMessage ? "bg-[#3fe9ff]/10 shadow-sm" : "bg-[#333333]/30 shadow-[0_0_8px_rgba(40,40,40,0.3)]"}`}>
              <div className={`flex items-center gap-1 ${emotionColor}`}>
                <span>{emotionInfo.icon}</span>
                <span>{emotionInfo.label}</span>
                {confidenceScore > 0 && (
                  <span className={`${isUserMessage ? "text-white/70" : "text-gray-400"} text-[10px]`}>
                    ({Math.round(confidenceScore * 100)}%)
                  </span>
                )}
              </div>
              
              {sentiment && (
                <div className={`flex items-center gap-1 ${sentimentColor}`}>
                  <span>{sentimentIcon}</span>
                  <span>{sentiment.primary.charAt(0).toUpperCase() + sentiment.primary.slice(1)}</span>
                  {sentiment.strength > 0 && (
                    <span className={`${isUserMessage ? "text-white/70" : "text-white/70"} text-[10px]`}>
                      ({Math.round(sentiment.strength * 100)}%)
                    </span>
                  )}
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent className="w-64 bg-background border-[#444444]/40 shadow-[0_0_15px_rgba(0,0,0,0.4)]">
            <div className="space-y-2">
              <p className="font-semibold text-[#999999]">Emotional Analysis</p>
              <div className="grid grid-cols-2 gap-1">
                {emotionDetails.all.slice(0, 6).map((item) => (
                  <div key={item.emotion} className="flex justify-between text-xs">
                    <span className="text-foreground">{item.emotion}:</span>
                    <span className={`${item.isPrimary ? "font-bold text-[#999999]" : "text-muted-foreground"}`}>
                      {Math.round(item.score * 100)}%
                    </span>
                  </div>
                ))}
              </div>
              
              {sentiment && (
                <>
                  <p className="font-semibold pt-1 text-[#999999]">Sentiment Analysis</p>
                  <div className="grid grid-cols-2 gap-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-foreground">Positive:</span>
                      <span className={`${sentiment.primary === "positive" ? "font-bold text-green-300" : "text-muted-foreground"}`}>
                        {Math.round(sentiment.predictions.Positive * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-foreground">Negative:</span>
                      <span className={`${sentiment.primary === "negative" ? "font-bold text-red-300" : "text-muted-foreground"}`}>
                        {Math.round(sentiment.predictions.Negative * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-foreground">Neutral:</span>
                      <span className={`${sentiment.primary === "neutral" ? "font-bold text-gray-300" : "text-muted-foreground"}`}>
                        {Math.round(sentiment.predictions.Neutral * 100)}%
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  // Simpler version without tooltip for basic emotion display
  return (
    <div className={`flex items-center gap-3 text-xs px-2 py-1 rounded-full ${isUserMessage ? "bg-[#3fe9ff]/10 shadow-sm" : "bg-[#333333]/30 shadow-[0_0_8px_rgba(40,40,40,0.3)]"}`}>
      <div className={`flex items-center gap-1 ${emotionColor}`}>
        <span>{emotionInfo.icon}</span>
        <span>{emotionInfo.label}</span>
      </div>
      
      {sentiment && (
        <div className={`flex items-center gap-1 ${sentimentColor}`}>
          <span>{sentimentIcon}</span>
          <span>{sentiment.primary.charAt(0).toUpperCase() + sentiment.primary.slice(1)}</span>
        </div>
      )}
    </div>
  );
};

// Update the KeywordsDisplay component
const KeywordsDisplay = ({ keywords, isUserMessage = false }: { keywords?: string[], isUserMessage?: boolean }) => {
  if (!keywords || keywords.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {keywords.map((keyword, index) => (
        <span 
          key={index} 
          className={
            isUserMessage 
              ? "px-2 py-0.5 text-xs rounded-full bg-[#3fe9ff]/10 text-[#3fe9ff] border border-[#3fe9ff]/30 shadow-sm"
              : "px-2 py-0.5 text-xs rounded-full bg-[#333333]/30 text-[#999999] border border-[#444444]/40 shadow-sm"
          }
        >
          {keyword}
        </span>
      ))}
    </div>
  );
};

// Add this component for the typing indicator dots
const TypingIndicator = () => {
  return (
    <div className="flex items-center space-x-1">
      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "600ms" }} />
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
                {message.sender === "user" ? (
                  // User message - styled exactly like the example
                  <div className="max-w-[80%] ml-12 relative">
                    {/* This implements the exact button structure from the example */}
                    <div className="cursor-pointer text-base rounded-2xl border-none p-0.5 bg-user-message-outer relative">
                      {/* Create the exact after effect */}
                      <div className="absolute w-[65%] h-[60%] rounded-[120px] top-0 right-0 shadow-message-glow -z-10"></div>
                      
                      {/* Create the blob1 element */}
                      <div className="absolute w-[70px] h-full rounded-2xl bottom-0 left-0 bg-user-message-blob1 shadow-message-blob-glow"></div>
                      
                      {/* Create the inner container */}
                      <div className="py-[14px] px-[25px] rounded-[14px] text-white z-[3] relative bg-user-message-inner">
                        {/* Add the inner::before effect */}
                        <div className="absolute w-full h-full left-0 top-0 rounded-[14px] bg-user-message-blob2"></div>
                        
                        {/* Message content */}
                        <div className="relative z-10">
                          {/* Message header with timestamp */}
                          <div className="flex justify-between w-full text-xs text-white/70 mb-1">
                            <span>You</span>
                            <span>{formatTime(message.timestamp)}</span>
                          </div>
                          
                          {/* Message text content */}
                          <div className="mt-1 relative z-10">
                            {message.isTypingIndicator ? (
                              <TypingIndicator />
                            ) : (
                              message.content
                            )}
                          </div>
                          
                          {/* Message footer with emotion indicators */}
                          {(message.emotion || message.emotionDetails || message.sentiment || (message.keywords && message.keywords.length > 0)) && (
                            <div className="mt-2 space-y-2 relative z-10">
                              {/* Display emotion data if available, or placeholder for user messages */}
                              {(message.emotion || message.emotionDetails || message.sentiment) ? (
                                // Use available emotion data
                                <EmotionIndicator
                                  emotion={message.emotion}
                                  emotionDetails={message.emotionDetails}
                                  sentiment={message.sentiment}
                                  isUserMessage={true}
                                />
                              ) : (
                                // No emotion data available - show analysis in progress or neutral
                                <div className="flex items-center gap-3 text-xs px-2 py-1 rounded-full bg-[#3fe9ff]/10 shadow-sm">
                                  <div className="flex items-center gap-1 text-[#3fe9ff]">
                                    <span>📊</span>
                                    <span>Analyzing...</span>
                                  </div>
                                </div>
                              )}
                              
                              {/* Show keywords if available */}
                              {message.keywords && message.keywords.length > 0 && (
                                <KeywordsDisplay keywords={message.keywords} isUserMessage={true} />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // AI message - with metallic finish styling similar to user message
                  <div className="max-w-[80%] mr-12 relative">
                    <div className="cursor-pointer text-base rounded-2xl border-none p-0.5 bg-ai-message-outer relative shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                      {/* Create the glow effect - enhanced dark metallic shine */}
                      <div className="absolute w-[65%] h-[60%] rounded-[120px] top-0 right-0 shadow-[0_0_15px_rgba(50,50,50,0.25)] -z-10"></div>
                      
                      {/* Create the blob1 element */}
                      <div className="absolute w-[70px] h-full rounded-2xl bottom-0 left-0 bg-ai-message-blob1 shadow-[inset_-5px_10px_20px_rgba(40,40,40,0.2)]"></div>
                      
                      {/* Add metallic reflection highlight */}
                      <div className="absolute w-[20%] h-[25%] bg-gradient-to-br from-[#555555]/30 to-transparent rounded-full top-[10%] left-[10%] blur-sm"></div>
                      
                      {/* Create the inner container */}
                      <div className="py-[14px] px-[25px] rounded-[14px] text-foreground z-[3] relative bg-ai-message-inner">
                        {/* Add the inner::before effect - more pronounced metallic shine */}
                        <div className="absolute w-full h-full left-0 top-0 rounded-[14px] bg-ai-message-blob2"></div>
                        
                        {/* Add subtle light reflection line */}
                        <div className="absolute h-[1px] w-[70%] bg-gradient-to-r from-transparent via-[#444444]/30 to-transparent top-[15%] left-[15%]"></div>
                        
                        {/* Message content */}
                        <div className="relative z-10">
                          {/* Message header with avatar and timestamp */}
                          <div className="flex items-center gap-2 mb-1">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src="https://api.dicebear.com/7.x/bottts/svg?seed=companion"
                                alt="AI"
                              />
                              <AvatarFallback>AI</AvatarFallback>
                            </Avatar>
                            <div className="flex justify-between w-full text-xs text-foreground/70">
                              <span>AI Companion</span>
                              <span>{formatTime(message.timestamp)}</span>
                            </div>
                          </div>
                          
                          {/* Message text content */}
                          <div className="mt-1 relative z-10">
                            {message.isTypingIndicator ? (
                              <TypingIndicator />
                            ) : (
                              message.content
                            )}
                          </div>
                          
                          {/* Message footer with emotion indicators */}
                          {(message.emotion || message.emotionDetails || message.sentiment || (message.keywords && message.keywords.length > 0)) && (
                            <div className="mt-2 space-y-2 relative z-10">
                              {(message.emotion || message.emotionDetails || message.sentiment) && (
                                <EmotionIndicator
                                  emotion={message.emotion}
                                  emotionDetails={message.emotionDetails}
                                  sentiment={message.sentiment}
                                  isUserMessage={false}
                                />
                              )}
                              
                              {/* Show keywords if available */}
                              {message.keywords && message.keywords.length > 0 && (
                                <KeywordsDisplay keywords={message.keywords} isUserMessage={false} />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
