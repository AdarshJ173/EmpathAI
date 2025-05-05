"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";

interface VoiceVisualizerProps {
  isListening?: boolean;
  isAiSpeaking?: boolean;
  onStartListening?: () => void;
  onStopListening?: () => void;
  audioLevel?: number;
  isChatMode?: boolean;
}

const VoiceVisualizer = ({
  isListening = false,
  isAiSpeaking = false,
  onStartListening = () => {},
  onStopListening = () => {},
  audioLevel = 0,
  isChatMode = false,
}: VoiceVisualizerProps) => {
  const toggleListening = () => {
    if (isListening) {
      onStopListening();
    } else {
      onStartListening();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto p-6 rounded-2xl transition-all duration-500 ease-in-out">
      {/* Clickable water drop visualizer */}
      <div 
        className={`mb-10 cursor-pointer ${isListening ? 'active-visualizer' : ''}`}
        onClick={toggleListening}
        role="button"
        aria-label={isListening ? "Stop listening" : "Start listening"}
      >
        <div className={`loader ${isChatMode ? 'scale-125' : ''}`}></div>
      </div>

      {/* Status indicator - more minimal */}
      <div className="mb-6 text-sm font-light tracking-wide text-center opacity-80 transition-opacity duration-300">
        {isListening ? (
          <span className="flex items-center justify-center text-primary transition-all duration-300">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Listening to you...
          </span>
        ) : isAiSpeaking ? (
          <span className="flex items-center justify-center text-blue-400 transition-all duration-300">
            <Volume2 className="h-3 w-3 mr-2 animate-pulse" />
            AI Speaking...
          </span>
        ) : (
          <span className="text-muted-foreground transition-all duration-300">
            Click the Orb to start conversation
          </span>
        )}
      </div>
    </div>
  );
};

export default VoiceVisualizer;
