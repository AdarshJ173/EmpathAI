"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { Button } from "./ui/button";

interface VoiceVisualizerProps {
  isListening?: boolean;
  isAiSpeaking?: boolean;
  onStartListening?: () => void;
  onStopListening?: () => void;
  audioLevel?: number;
}

const VoiceVisualizer = ({
  isListening = false,
  isAiSpeaking = false,
  onStartListening = () => {},
  onStopListening = () => {},
  audioLevel = 0,
}: VoiceVisualizerProps) => {
  const [bars, setBars] = useState<number[]>(Array(20).fill(0));
  const animationRef = useRef<number>();

  // Generate smoother bar heights for visualization
  const generateBars = () => {
    if (isListening || isAiSpeaking) {
      const newBars = bars.map((height, index) => {
        // Create more dynamic movement with smoother transitions
        const targetHeight = Math.random() * 70;
        const amplifiedHeight =
          targetHeight * (audioLevel > 0 ? audioLevel : 1);
        // Smooth transition by only changing by a small amount each frame
        const smoothedHeight = height + (amplifiedHeight - height) * 0.2;
        return Math.min(100, smoothedHeight);
      });
      setBars(newBars);
    } else {
      // When not active, show minimal ambient movement
      const newBars = bars.map((height) => {
        const targetHeight = Math.random() * 8;
        return height + (targetHeight - height) * 0.1;
      });
      setBars(newBars);
    }
  };

  useEffect(() => {
    // Animation loop for the visualizer with smoother frame rate
    const animate = () => {
      generateBars();
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
    // Fixed dependency array to include the generateBars function
  }, [isListening, isAiSpeaking, audioLevel, bars]);

  const toggleListening = () => {
    if (isListening) {
      onStopListening();
    } else {
      onStartListening();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto p-6 rounded-2xl transition-all duration-500 ease-in-out">
      {/* Voice visualizer bars - more minimal and aesthetic */}
      <div className="flex items-end justify-center h-32 w-full gap-1.5 mb-10 transition-all duration-300">
        {bars.map((height, index) => (
          <div
            key={index}
            className={`w-1.5 rounded-full transition-all duration-300 ease-out ${isListening ? "bg-primary" : isAiSpeaking ? "bg-blue-400" : "bg-gray-200 dark:bg-gray-700"}`}
            style={{
              height: `${height}%`,
              opacity: 0.7 + Math.random() * 0.3,
              transform: `scaleY(${height > 0 ? 1 : 0.1})`,
              transformOrigin: "bottom",
            }}
          />
        ))}
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
            Click the microphone to start
          </span>
        )}
      </div>

      {/* Control button - more aesthetic */}
      <Button
        onClick={toggleListening}
        variant={isListening ? "destructive" : "default"}
        size="lg"
        className="rounded-full h-16 w-16 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
      >
        {isListening ? (
          <MicOff className="h-6 w-6 transition-all duration-300" />
        ) : (
          <Mic className="h-6 w-6 transition-all duration-300" />
        )}
      </Button>
    </div>
  );
};

export default VoiceVisualizer;
