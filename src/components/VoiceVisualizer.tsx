"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, Keyboard } from "lucide-react";
import { voiceRecognition, voiceSynthesis } from "@/lib/voice-recognition";

interface VoiceVisualizerProps {
  isListening?: boolean;
  isAiSpeaking?: boolean;
  onStartListening?: () => void;
  onStopListening?: () => void;
  audioLevel?: number;
  isChatMode?: boolean;
  usesFallbackMode?: boolean;
}

const VoiceVisualizer = ({
  isListening = false,
  isAiSpeaking = false,
  onStartListening = () => {},
  onStopListening = () => {},
  audioLevel = 0,
  isChatMode = false,
  usesFallbackMode = false,
}: VoiceVisualizerProps) => {
  const [visualizerSize, setVisualizerSize] = useState(100);
  const [pulsing, setPulsing] = useState(false);
  const pulseInterval = useRef<NodeJS.Timeout | null>(null);

  // Effect to animate the visualizer based on audio level or AI speaking
  useEffect(() => {
    // Determine base size based on chat mode
    const baseSize = isChatMode ? 75 : 100;
    
    if (isAiSpeaking) {
      // Pulsing effect for AI speaking
      if (!pulseInterval.current) {
        setPulsing(true);
        pulseInterval.current = setInterval(() => {
          setVisualizerSize(baseSize + Math.random() * 30);
        }, 150);
      }
    } else if (isListening) {
      // Set size based on audio level when listening
      const newSize = baseSize + (audioLevel * 50);
      setVisualizerSize(newSize);
      setPulsing(false);
      
      // Clear any existing pulse interval
      if (pulseInterval.current) {
        clearInterval(pulseInterval.current);
        pulseInterval.current = null;
      }
    } else {
      // Reset to base size when not active
      setVisualizerSize(baseSize);
      setPulsing(false);
      
      // Clear any existing pulse interval
      if (pulseInterval.current) {
        clearInterval(pulseInterval.current);
        pulseInterval.current = null;
      }
    }

    // Cleanup
    return () => {
      if (pulseInterval.current) {
        clearInterval(pulseInterval.current);
      }
    };
  }, [isListening, isAiSpeaking, audioLevel, isChatMode]);

  const toggleListening = () => {
    // Don't allow toggling if AI is speaking, but allow interrupting
    if (isAiSpeaking) {
      // Interrupt AI speech and start listening immediately
      voiceSynthesis?.stop();
      onStartListening();
      return;
    }
    
    if (isListening) {
      onStopListening();
      voiceSynthesis?.stop(); // Stop any ongoing speech
    } else {
      onStartListening();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto p-6 rounded-2xl transition-all duration-500 ease-in-out">
      {/* Clickable water drop visualizer */}
      <div 
        className={`mb-10 cursor-pointer ${isListening ? 'active-visualizer' : ''} ${isAiSpeaking ? 'ai-speaking' : ''} ${pulsing ? 'pulsing' : ''} ${usesFallbackMode ? 'fallback-mode' : ''}`}
        onClick={toggleListening}
        role="button"
        aria-label={isListening ? "Stop listening" : "Start listening"}
        style={{
          pointerEvents: 'auto', // Always allow clicking to interrupt AI or start listening
        }}
      >
        <div 
          className={`loader ${isChatMode ? 'scale-90' : ''}`}
          style={{
            transform: `scale(${visualizerSize / 100})`,
            transition: 'transform 0.2s ease-out',
          }}
        >
          {/* Keyboard icon for fallback mode */}
          {usesFallbackMode && isListening && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <Keyboard className="h-12 w-12 opacity-60" />
            </div>
          )}
        </div>
      </div>

      {/* Status indicator */}
      <div className="mb-6 text-sm font-light tracking-wide text-center opacity-80 transition-opacity duration-300">
        {isListening ? (
          <span className="flex items-center justify-center text-primary transition-all duration-300">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            {usesFallbackMode ? "Ready for your message..." : "Listening to you..."}
          </span>
        ) : isAiSpeaking ? (
          <span className="flex items-center justify-center text-red-500 transition-all duration-300">
            <div className="flex items-center gap-1 mr-2">
              <div className="w-1 h-1 bg-red-500 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-1 h-1 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
            <span className="font-medium">AI Speaking...</span> 
            <span className="ml-2 text-xs text-red-400/70 italic">(click to interrupt)</span>
          </span>
        ) : (
          <span className="text-muted-foreground transition-all duration-300">
            Click the Orb to {usesFallbackMode ? "start" : "speak"}
          </span>
        )}
      </div>

      {/* Fallback mode indicator */}
      {usesFallbackMode && !isListening && !isAiSpeaking && (
        <div className="text-xs text-muted-foreground mt-1 flex items-center">
          <Keyboard className="h-3 w-3 mr-1" />
          <span>Text input mode active</span>
        </div>
      )}
    </div>
  );
};

export default VoiceVisualizer;
