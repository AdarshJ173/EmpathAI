"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";
import VoiceVisualizer from "@/components/VoiceVisualizer";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import HistorySection from "@/components/HistorySection";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import { useUser } from "@clerk/nextjs";
import ShinyText from '@/components/ShinyText';
import Link from "next/link";
import { voiceRecognition, voiceSynthesis, type AudioLevelCallback } from "@/lib/voice-recognition";

export default function Home() {
  const router = useRouter();
  const { user } = useUser();
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [showChatInterface, setShowChatInterface] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if voice recognition is using fallback mode
  useEffect(() => {
    if (voiceRecognition) {
      setIsUsingFallback(voiceRecognition.isFallbackMode());
    }
  }, []);

  // Set up speech synthesis
  useEffect(() => {
    // Monitor speech synthesis state
    const checkSpeechState = setInterval(() => {
      setIsAiSpeaking(!!voiceSynthesis?.isCurrentlySpeaking());
    }, 200);

    return () => {
      clearInterval(checkSpeechState);
    };
  }, []);

  const handleStartListening = () => {
    setIsListening(true);
    
    // Start audio level monitoring
    voiceRecognition?.startAudioLevelMonitoring((level: number) => {
      setAudioLevel(level);
    });
  };

  const handleStopListening = () => {
    setIsListening(false);
    setAudioLevel(0);
    voiceRecognition?.stopListening();
  };

  const toggleChatInterface = () => {
    setShowChatInterface(!showChatInterface);
  };

  // Handle text input for fallback mode
  const handleTextInput = (text: string) => {
    if (isUsingFallback && isListening && voiceRecognition) {
      voiceRecognition.simulateVoiceInput(text, () => {
        // After simulation, wait a bit and stop listening
        setTimeout(() => {
          setIsListening(false);
        }, 500);
      });
    }
  };

  // Close history panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target as Node) &&
        showHistory
      ) {
        setShowHistory(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showHistory]);

  // Cleanup voice when component unmounts
  useEffect(() => {
    return () => {
      voiceRecognition?.stopListening();
      voiceSynthesis?.stop();
    };
  }, []);

  return (
    <main className={`flex min-h-screen h-screen max-h-screen flex-col items-center justify-between p-4 bg-background transition-colors duration-500 ease-in-out overflow-hidden ${showChatInterface ? 'split-active' : ''}`}>
      <div className="w-full max-w-7xl flex flex-col h-full max-h-full">
        {/* Refined header - ultra minimalistic */}
        <header className="flex items-center py-4 px-1">
          <div className="flex items-center gap-4">
          <div className="text-lg font-extralight tracking-wider text-primary transition-all duration-300 opacity-80 hover:opacity-100">
            <ShinyText text="EmpathAI" disabled={false} speed={3} className="text-lg font-extralight tracking-wider" />
            </div>
            <Link 
              href="/about"
              className="text-sm font-light opacity-60 hover:opacity-100 transition-opacity"
            >
              About
            </Link>
          </div>
          
          {/* Spacer to push items to sides */}
          <div className="flex-1"></div>
          
          <div className="flex items-center gap-3">
            {/* Auth buttons */}
            <SignedOut>
              <SignInButton mode="modal">
                <button className="button scale-90 hover:scale-95 transition-transform duration-200">
                  <div className="blob1"></div>
                  <div className="blob2"></div>
                  <div className="inner">Sign In</div>
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <span className="text-sm mr-2">
                Hello, {user?.firstName || 'User'}
              </span>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            
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
            
            {/* Search Bar */}
            <div 
              ref={searchBarRef}
              className="relative hidden md:block"
              onMouseEnter={() => setShowHistory(true)}
              onClick={() => setShowHistory(true)}
            >
              <SearchBar />
              
              {/* History Panel that appears on search bar hover/click */}
              <AnimatePresence>
                {showHistory && (
                  <motion.div 
                    className="absolute top-full right-0 mt-2 w-[400px] bg-background rounded-md shadow-lg z-50 overflow-hidden max-h-[80vh]"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="h-[70vh] overflow-auto">
                      <HistorySection />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
              usesFallbackMode={isUsingFallback}
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
                onTextInput={handleTextInput}
                usesFallbackMode={isUsingFallback}
              />
            </motion.div>
          )}
        </div>

        {/* Fallback mode info tooltip - only show briefly when using fallback */}
        {isUsingFallback && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-md text-sm animate-fade-in-out">
            Using text-based input for voice interaction
            <span className="text-xs block mt-1 opacity-70">(Click the orb and type your message)</span>
          </div>
        )}
      </div>
    </main>
  );
}
