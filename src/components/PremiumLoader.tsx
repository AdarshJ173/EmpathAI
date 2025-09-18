"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";

interface PremiumLoaderProps {
  message?: string;
}

export default function PremiumLoader({ message = "Loading..." }: PremiumLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden">
      {/* Background dark shimmer effect */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/20 to-transparent"
          animate={{
            x: [-1000, 1000]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gray-600/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              y: [0, -20, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Main logo/brand section */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Outer ring */}
          <motion.div
            className="absolute inset-0 w-24 h-24 rounded-full"
            style={{
              background: "conic-gradient(from 0deg, #374151, #4b5563, #6b7280, #374151)",
            }}
            animate={{
              rotate: 360
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear"
            }}
          />

          {/* Middle ring */}
          <motion.div
            className="absolute inset-2 rounded-full"
            style={{
              background: "conic-gradient(from 180deg, #1f2937, #374151, #4b5563, #1f2937)",
            }}
            animate={{
              rotate: -360
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          />

          {/* Inner circle with heart */}
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center shadow-2xl border border-gray-800">
            {/* Metallic shine effect */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-700/20 via-transparent to-transparent"
              animate={{
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Heart icon */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Heart className="w-8 h-8 text-pink-600 fill-pink-600/30" />
            </motion.div>
          </div>
        </motion.div>

        {/* Brand name */}
        <motion.div
          className="text-center space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        >
          <motion.h1 
            className="text-3xl font-extralight tracking-[0.2em] text-white"
            style={{
              background: "linear-gradient(135deg, #e5e7eb, #9ca3af, #6b7280)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 0 30px rgba(255,255,255,0.05)"
            }}
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            EmpathAI
          </motion.h1>
          
          <div className="relative">
            <motion.p 
              className="text-sm font-light tracking-wider text-gray-400/80"
              animate={{
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {message}
            </motion.p>
            
            {/* Loading dots */}
            <div className="flex justify-center space-x-1 mt-3">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 bg-gray-500 rounded-full"
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1, 0.8]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          className="w-64 h-0.5 bg-gray-900 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-gray-600 to-gray-400 rounded-full"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </div>

      {/* Bottom corner accent */}
      <motion.div
        className="absolute bottom-8 right-8 w-16 h-16 opacity-10"
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1]
        }}
        transition={{
          rotate: {
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          },
          scale: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
        <div className="w-full h-full border-2 border-gray-800/40 rounded-full" />
        <div className="absolute inset-2 border border-gray-700/20 rounded-full" />
        <div className="absolute inset-4 bg-gray-600/10 rounded-full" />
      </motion.div>
    </div>
  );
}
