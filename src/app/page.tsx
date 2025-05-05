"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";
import VoiceVisualizer from "@/components/VoiceVisualizer";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import HistorySection from "@/components/HistorySection";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [showChatInterface, setShowChatInterface] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

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
    setIsTransitioning(true);
    setTimeout(() => {
      setShowChatInterface(!showChatInterface);
      setTimeout(() => setIsTransitioning(false), 300);
    }, 300);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 bg-background transition-colors duration-500 ease-in-out">
      <div className="w-full max-w-5xl flex flex-col h-screen">
        {/* Header - more minimal */}
        <header className="flex justify-between items-center py-6 px-2">
          <h1 className="text-xl font-light tracking-wide text-primary transition-all duration-300">
            AI Companion
          </h1>
          <div className="flex gap-3 items-center">
            <ThemeSwitcher />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleChatInterface}
              className="relative rounded-full transition-all duration-300 hover:bg-accent/50"
              disabled={isTransitioning}
            >
              <MessageSquare className="h-5 w-5 transition-transform duration-300" />
              {!showChatInterface && (
                <span className="absolute top-0 right-0 h-2 w-2 bg-primary rounded-full animate-pulse" />
              )}
              <span className="sr-only">Toggle chat interface</span>
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full transition-all duration-300 hover:bg-accent/50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
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
                className="w-full sm:w-[400px] md:w-[600px] border-none"
              >
                <HistorySection />
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Main Content Area with smooth transitions */}
        <div className="flex-grow overflow-hidden flex items-center justify-center relative">
          <div
            className={`w-full transition-opacity duration-500 ease-in-out absolute inset-0 ${showChatInterface ? "opacity-100 z-10" : "opacity-0 z-0"}`}
            style={{ pointerEvents: showChatInterface ? "auto" : "none" }}
          >
            <ChatInterface
              isListening={isListening}
              onStartListening={handleStartListening}
              onStopListening={handleStopListening}
            />
          </div>
          <div
            className={`w-full max-w-2xl mx-auto transition-opacity duration-500 ease-in-out absolute inset-0 flex items-center justify-center ${!showChatInterface ? "opacity-100 z-10" : "opacity-0 z-0"}`}
            style={{ pointerEvents: !showChatInterface ? "auto" : "none" }}
          >
            <VoiceVisualizer
              isListening={isListening}
              isAiSpeaking={isAiSpeaking}
              onStartListening={handleStartListening}
              onStopListening={handleStopListening}
              audioLevel={audioLevel}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
