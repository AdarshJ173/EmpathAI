"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import ShinyText from "@/components/ShinyText";
import "./about.css";

export default function About() {
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeCard, setActiveCard] = useState<string | null>(null);
  
  // Add hover effect for cards
  const handleCardHover = (cardId: string) => {
    setActiveCard(cardId);
  };

  const handleCardLeave = () => {
    setActiveCard(null);
  };

  // Card reveal animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  // Enhanced glass card style
  const glassCardStyle = `
    relative overflow-hidden rounded-lg
    border border-border/30 hover:border-border/50
    bg-gradient-to-br from-background/80 via-background/60 to-background/30
    backdrop-blur-xl
    shadow-[0_8px_16px_rgba(0,0,0,0.1)]
    transition-all duration-500 ease-out
    hover:shadow-[0_16px_32px_rgba(0,0,0,0.15)]
    hover:scale-[1.02]
    before:content-['']
    before:absolute before:inset-0
    before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent
    before:translate-x-[-200%]
    hover:before:translate-x-[200%]
    before:transition-transform before:duration-1000
    group
  `;

  // Add scroll animation effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      sectionsRef.current.forEach((section) => {
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  // Track mouse position for glass effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Handle section refs
  const handleSectionRef = (index: number) => (el: HTMLElement | null) => {
    if (sectionsRef.current) {
      sectionsRef.current[index] = el;
    }
  };

  return (
    <main 
      ref={containerRef}
      className="relative flex min-h-screen flex-col items-center bg-background text-foreground overflow-y-auto overflow-x-hidden"
    >
      {/* Glass gradient effect that follows cursor */}
      <div 
        className="glass-radial" 
        style={{
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
        }}
      />
      
      <div className="w-full max-w-[95%] xl:max-w-7xl 2xl:max-w-[90rem] px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 space-y-16 sm:space-y-20 lg:space-y-28">
        {/* Hero section */}
        <section 
          ref={handleSectionRef(0)}
          className="flex flex-col items-center space-y-8 opacity-0 transition-opacity duration-1000"
        >
          <Link href="/" className="self-start mb-8 sm:mb-12 opacity-60 hover:opacity-100 transition-opacity">
            <span className="text-sm font-light hover:underline flex items-center gap-2">
              <span className="inline-block w-4 h-0.5 bg-foreground/50"></span>
              Back to home
            </span>
          </Link>

          <div className="text-center space-y-8">
            <div className="relative">
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extralight tracking-tight pb-3">
                <div className="relative">
                  {/* Base static text */}
                  <div className="opacity-10 metallic-text">EmpathAI</div>
                  {/* Animated overlay */}
                  <div className="absolute inset-0">
                    <ShinyText text="EmpathAI" disabled={false} speed={7} className="inline metallic-text" />
                  </div>
                </div>
              </h1>
              <div className="absolute w-24 sm:w-32 h-0.5 bg-gradient-to-r from-transparent via-foreground/30 to-transparent bottom-0 left-1/2 transform -translate-x-1/2"></div>
            </div>
            <p className="text-lg md:text-xl font-extralight text-muted-foreground max-w-lg mx-auto leading-relaxed">
              A safe, empathetic AI companion that listens, understands, and supports you.
            </p>
          </div>

          <div className="w-full max-w-xs mx-auto mt-8 opacity-20 floating">
            <svg className="w-full" viewBox="0 0 100 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 3L100 3" stroke="currentColor" strokeOpacity="0.5" strokeWidth="0.5" strokeDasharray="1 3"></path>
            </svg>
          </div>
        </section>

        {/* Problem section */}
        <section 
          ref={handleSectionRef(1)}
          className="space-y-10 opacity-0 transition-opacity duration-1000 max-w-6xl mx-auto w-full"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-tight relative metallic-text inline-block after:content-[''] after:absolute after:w-full after:h-[1px] after:bg-gradient-to-r after:from-transparent after:via-border after:to-transparent after:bottom-0 after:left-0">
            The Problem
          </h2>
          
          <div className="space-y-8">
            <p className="text-lg sm:text-xl text-foreground/70 font-light">
              In today's fast-paced world, many people struggle with:
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[
                {
                  id: "emotional-isolation",
                  title: "Emotional Isolation",
                  description: "Lack of safe spaces to express feelings without judgment",
                  details: "Many individuals face barriers in finding supportive environments where they can openly share their thoughts and emotions. This isolation can lead to increased stress and anxiety.",
                  stats: ["67% report feeling alone", "45% hesitate to share feelings"]
                },
                {
                  id: "privacy-concerns",
                  title: "Privacy Concerns",
                  description: "Fear that sharing personal thoughts might compromise confidentiality",
                  details: "In an increasingly connected world, maintaining privacy while seeking emotional support has become a significant challenge.",
                  stats: ["89% worry about data privacy", "72% want encrypted conversations"]
                },
                {
                  id: "limited-support",
                  title: "Limited Support",
                  description: "Difficulty finding empathetic listeners available anytime",
                  details: "Traditional support systems often have limited availability, leaving people without help when they need it most.",
                  stats: ["24/7 support needed", "3hr average wait time"]
                },
                {
                  id: "mental-health",
                  title: "Mental Health Barriers",
                  description: "Reduced access to timely emotional support resources",
                  details: "Cost, stigma, and availability create barriers to accessing mental health support when it's most needed.",
                  stats: ["78% face access barriers", "60% delay seeking help"]
                }
              ].map((item, index) => (
                <motion.div
                  key={item.id}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className={`${glassCardStyle} group`}
                  onMouseEnter={() => handleCardHover(item.id)}
                  onMouseLeave={handleCardLeave}
                >
                  <div className="p-6 md:p-8 relative z-10">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full border border-border/50 flex items-center justify-center flex-shrink-0 transition-colors group-hover:border-border">
                        <span className="text-xs opacity-60 group-hover:opacity-100 transition-opacity">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="space-y-4 w-full">
                        <div>
                          <h3 className="font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            {item.description}
                          </p>
                        </div>
                        
                        <div className={`overflow-hidden transition-all duration-500 ${activeCard === item.id ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                          <p className="text-sm text-foreground/80 mb-3">
                            {item.details}
                          </p>
                          <div className="flex gap-4">
                            {item.stats.map((stat, i) => (
                              <div key={i} className="bg-primary/5 rounded-md px-3 py-1 text-xs text-primary">
                                {stat}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Solution section */}
        <section 
          ref={handleSectionRef(2)}
          className="space-y-10 opacity-0 transition-opacity duration-1000 max-w-6xl mx-auto w-full"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-tight relative metallic-text inline-block after:content-[''] after:absolute after:w-full after:h-[1px] after:bg-gradient-to-r after:from-transparent after:via-border after:to-transparent after:bottom-0 after:left-0">
            Our Solution
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[
              {
                id: "ai-companion",
                icon: "smile",
                title: "Empathetic AI Companion",
                description: "EmpathAI creates a judgment-free zone where you can express yourself freely.",
                features: [
                  "Natural language understanding",
                  "Emotional state recognition",
                  "Personalized responses",
                  "24/7 availability"
                ]
              },
              {
                id: "privacy",
                icon: "shield",
                title: "Privacy-Focused",
                description: "Your conversations are secure and private with end-to-end encryption.",
                features: [
                  "End-to-end encryption",
                  "No third-party sharing",
                  "Data deletion options",
                  "Transparent practices"
                ]
              },
              {
                id: "availability",
                icon: "clock",
                title: "Always Available",
                description: "24/7 access to emotional support whenever you need it.",
                features: [
                  "Instant responses",
                  "No scheduling needed",
                  "Cross-platform access",
                  "Offline support"
                ]
              },
              {
                id: "personalization",
                icon: "user",
                title: "Personalized Experience",
                description: "AI that learns and adapts to your unique personality.",
                features: [
                  "Learning algorithm",
                  "Conversation memory",
                  "Pattern recognition",
                  "Adaptive responses"
                ]
              }
            ].map((item) => (
              <motion.div
                key={item.id}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className={`${glassCardStyle}`}
                onMouseEnter={() => handleCardHover(item.id)}
                onMouseLeave={handleCardLeave}
              >
                <div className="p-6 relative z-10">
                  <div className="mb-4 opacity-60 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full border border-border/50 flex items-center justify-center">
                      {item.icon === "smile" && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M9 9H9.01" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M15 9H15.01" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                      {item.icon === "shield" && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16.2426 7.75736L7.75736 16.2426" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M7.75736 7.75736L16.2426 16.2426" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                      {item.icon === "clock" && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                      {item.icon === "user" && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </div>
                  <h3 className="text-lg font-medium mb-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    {item.description}
                  </p>
                  
                  <div className={`overflow-hidden transition-all duration-500 ${activeCard === item.id ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <ul className="space-y-2">
                      {item.features.map((feature, i) => (
                        <li key={i} className="text-sm text-foreground/80 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Core Features section */}
        <section 
          ref={handleSectionRef(3)}
          className="space-y-10 opacity-0 transition-opacity duration-1000 max-w-6xl mx-auto w-full"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-tight relative metallic-text inline-block after:content-[''] after:absolute after:w-full after:h-[1px] after:bg-gradient-to-r after:from-transparent after:via-border after:to-transparent after:bottom-0 after:left-0">
            Core Features
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[
              {
                id: "ai-conversation",
                title: "AI-Powered Conversation",
                description: "Natural language processing enables meaningful, open-ended conversations that flow naturally.",
                details: "Our advanced AI understands context, emotions, and nuances in conversation, making interactions feel natural and meaningful.",
                features: [
                  "Context awareness",
                  "Natural language understanding",
                  "Adaptive responses",
                  "Conversation memory"
                ]
              },
              {
                id: "emotion-recognition",
                title: "Emotion Recognition",
                description: "The AI detects emotional states and responds with appropriate empathy and support.",
                details: "Using advanced sentiment analysis, we can understand the emotional context of your messages and provide appropriate support.",
                features: [
                  "Sentiment analysis",
                  "Emotional intelligence",
                  "Empathetic responses",
                  "Mood tracking"
                ]
              },
              {
                id: "voice-interaction",
                title: "Voice Interaction",
                description: "Speak naturally with the AI through our interactive voice visualizer.",
                details: "Our voice interface makes conversations more natural and accessible, with real-time visualization of your voice patterns.",
                features: [
                  "Voice recognition",
                  "Real-time visualization",
                  "Natural speech processing",
                  "Multi-language support"
                ]
              },
              {
                id: "conversation-history",
                title: "Conversation History",
                description: "Revisit past conversations to reflect on your thoughts and emotional journey.",
                details: "Securely store and access your conversation history to track your emotional growth and progress over time.",
                features: [
                  "Secure storage",
                  "Easy navigation",
                  "Emotional insights",
                  "Progress tracking"
                ]
              }
            ].map((item, index) => (
              <motion.div
                key={item.id}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className={`${glassCardStyle} group`}
                onMouseEnter={() => handleCardHover(item.id)}
                onMouseLeave={handleCardLeave}
              >
                <div className="p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full w-12 h-12 border border-border/50 flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs">{String(index + 1).padStart(2, '0')}</span>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium mb-2 group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {item.description}
                        </p>
                      </div>
                      
                      <div className={`overflow-hidden transition-all duration-500 ${activeCard === item.id ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <p className="text-sm text-foreground/80 mb-3">
                          {item.details}
                        </p>
                        <ul className="space-y-2">
                          {item.features.map((feature, i) => (
                            <li key={i} className="text-sm text-foreground/80 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Vision section */}
        <section 
          ref={handleSectionRef(4)}
          className="space-y-10 opacity-0 transition-opacity duration-1000 max-w-6xl mx-auto w-full"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-tight relative metallic-text inline-block after:content-[''] after:absolute after:w-full after:h-[1px] after:bg-gradient-to-r after:from-transparent after:via-border after:to-transparent after:bottom-0 after:left-0">
            Our Vision
          </h2>
          
          <div className="space-y-8">
            <p className="text-lg sm:text-xl text-foreground/70 font-light">
              We believe technology should enhance human connection, not replace it. 
              EmpathAI strives to create a world where:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {[
                {
                  id: "vision-1",
                  title: "Universal Access",
                  description: "Everyone has access to emotional support whenever they need it",
                  details: "We're committed to making emotional support accessible to all, regardless of location, time, or circumstances.",
                  stats: ["24/7 availability", "Global reach"]
                },
                {
                  id: "vision-2",
                  title: "Personal Growth",
                  description: "Technology empowers individuals to understand themselves better",
                  details: "Through AI-powered insights and continuous learning, we help users develop greater self-awareness and emotional intelligence.",
                  stats: ["Personalized insights", "Growth tracking"]
                },
                {
                  id: "vision-3",
                  title: "Mental Well-being",
                  description: "Mental well-being is prioritized and destigmatized",
                  details: "We're working to create a world where mental health is given the same importance as physical health.",
                  stats: ["Stigma reduction", "Preventive care"]
                },
                {
                  id: "vision-4",
                  title: "Ethical Innovation",
                  description: "Privacy and ethical AI development go hand in hand",
                  details: "We're committed to developing AI technology that respects user privacy and adheres to the highest ethical standards.",
                  stats: ["Privacy-first", "Ethical AI"]
                }
              ].map((item) => (
                <motion.div
                  key={item.id}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className={`${glassCardStyle} group`}
                  onMouseEnter={() => handleCardHover(item.id)}
                  onMouseLeave={handleCardLeave}
                >
                  <div className="p-6 relative z-10">
                    <h3 className="text-lg font-medium mb-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {item.description}
                    </p>
                    
                    <div className={`overflow-hidden transition-all duration-500 ${activeCard === item.id ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <p className="text-sm text-foreground/80 mb-3">
                        {item.details}
                      </p>
                      <div className="flex gap-3">
                        {item.stats.map((stat, i) => (
                          <div key={i} className="bg-primary/5 rounded-md px-3 py-1 text-xs text-primary">
                            {stat}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer 
          ref={handleSectionRef(5)}
          className="border-t border-border/30 pt-10 mt-20 text-center opacity-0 transition-opacity duration-1000 max-w-6xl mx-auto w-full"
        >
          <div className="metallic-text pb-4 text-sm opacity-80">
            EmpathAI — Talk, Share, Be Heard.
          </div>
          <Link href="/" className="inline-block mt-2 text-xs opacity-60 hover:opacity-100 transition-opacity">
            Return to home
          </Link>
          
          <div className="w-full max-w-xs mx-auto mt-8 opacity-20">
            <svg className="w-full" viewBox="0 0 100 1" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0.5L100 0.5" stroke="currentColor" strokeOpacity="0.3" strokeWidth="0.5" strokeDasharray="1 3" />
            </svg>
          </div>
        </footer>
      </div>
    </main>
  );
} 