"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";
import VoiceVisualizer from "@/components/VoiceVisualizer";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import HistorySection from "@/components/HistorySection";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [showChatInterface, setShowChatInterface] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  const handleStartListening = () => {
    setIsListening(true);
    // In a real implementation, this would start voice recording
    // and process audio levels
    simulateAudioLevels();
  };

  const handleStopListening = () => {
    setIsListening(false);
    setAudioLevel(0);
    // In a real implementation, this would stop voice recording
  };

  // Simulate changing audio levels for the visualizer
  const simulateAudioLevels = () => {
    if (!isListening) return;

    const interval = setInterval(() => {
      if (!isListening) {
        clearInterval(interval);
        return;
      }
      setAudioLevel(Math.random() * 0.8 + 0.2); // Random value between 0.2 and 1.0
    }, 200);

    // This cleanup function was incorrectly returning from the main function
    // It should be set up with useEffect instead
  };

  // Set up proper cleanup for the audio level simulation
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (isListening) {
      interval = setInterval(() => {
        setAudioLevel(Math.random() * 0.8 + 0.2);
      }, 200);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isListening]);

  const toggleChatInterface = () => {
    setShowChatInterface(!showChatInterface);
  };

  const goToDashboard = () => {
    window.location.href = "/dashboard";
  };

  return (
    <main className={`flex min-h-screen h-screen max-h-screen flex-col items-center justify-between p-4 bg-background transition-colors duration-500 ease-in-out overflow-hidden ${showChatInterface ? 'split-active' : ''}`}>
      <div className="w-full max-w-7xl flex flex-col h-full max-h-full">
        {/* Refined header - ultra minimalistic */}
        <header className="flex items-center py-4 px-1">
          <div className="text-lg font-extralight tracking-wider text-primary transition-all duration-300 opacity-80 hover:opacity-100">
            EmpathAI
          </div>
          
          {/* Spacer to push items to sides */}
          <div className="flex-1"></div>
          
          {/* Auth buttons */}
          <div className="mr-4 flex items-center gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline" size="sm" className="rounded-full">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Button variant="outline" size="sm" onClick={goToDashboard}>
                Dashboard
              </Button>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
          
          <div className="flex gap-2 items-center">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleChatInterface}
              className="relative h-8 w-8 p-0 rounded-full transition-all duration-300 hover:bg-accent/30"
            >
              <MessageSquare className="h-4 w-4 transition-transform duration-300" />
              {!showChatInterface && (
                <span className="absolute top-0 right-0 h-1.5 w-1.5 bg-primary rounded-full animate-pulse" />
              )}
              <span className="sr-only">Toggle chat interface</span>
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full transition-all duration-300 hover:bg-accent/30"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M3 12h18" />
                    <path d="M3 6h18" />
                    <path d="M3 18h18" />
                  </svg>
                  <span className="sr-only">View history</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-full sm:w-[400px] md:w-[600px] border-none p-0"
              >
                <HistorySection />
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Main Content Area with split-screen layout */}
        <div className="flex-grow flex overflow-hidden">
          {/* Left side - Always visible visualizer */}
          <motion.div 
            className="visualizer-container flex items-center justify-start pl-1"
            initial={{ width: "100%" }}
            animate={{ 
              width: showChatInterface ? "70%" : "100%",
            }}
            transition={{ 
              type: "spring",
              stiffness: 400,
              damping: 25,
              mass: 0.8,
              velocity: 2
            }}
          >
            <VoiceVisualizer
              isListening={isListening}
              isAiSpeaking={isAiSpeaking}
              onStartListening={handleStartListening}
              onStopListening={handleStopListening}
              audioLevel={audioLevel}
              isChatMode={showChatInterface}
            />
          </motion.div>

          {/* Right side - Chat interface */}
          {showChatInterface && (
            <motion.div 
              className="h-full"
              initial={{ width: 0, opacity: 0, x: 30 }}
              animate={{ width: "100%", opacity: 1, x: 0 }}
              exit={{ width: 0, opacity: 0, x: 50 }}
              transition={{ 
                type: "spring",
                stiffness: 400,
                damping: 25,
                mass: 0.8,
                velocity: 2
              }}
            >
              <ChatInterface
                isListening={isListening}
                onStartListening={handleStartListening}
                onStopListening={handleStopListening}
              />
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
