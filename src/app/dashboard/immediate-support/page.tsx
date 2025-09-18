"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  ArrowLeft, 
  AlertTriangle, 
  MessageCircle, 
  Zap,
  Heart,
  Brain,
  Shield,
  Eye,
  Headphones,
  Monitor,
  Timer,
  RotateCcw,
  Send,
  Sparkles,
  Users,
  Phone,
  Target,
  Compass,
  Waves,
  Briefcase
} from "lucide-react";
import ShinyText from "@/components/ShinyText";
import PremiumLoader from "@/components/PremiumLoader";

type SupportMode = 'selection' | 'reassurance' | 'sos-distract' | 'sos-work';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function ImmediateSupport() {
  const [currentMode, setCurrentMode] = useState<SupportMode>('selection');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [distractionActivity, setDistractionActivity] = useState<string | null>(null);
  const [workModeActive, setWorkModeActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const responses = currentMode === 'reassurance' 
        ? [
            "I understand you're feeling anxious right now. Let's think about this logically. What specifically are you worried might happen?",
            "Those 'what if' thoughts can feel very real, but let's examine the evidence. How often have your worst fears actually come true?",
            "It sounds like your mind is trying to protect you, but this worry might be bigger than the actual risk. Can you tell me more about what triggered this feeling?",
            "You're safe right now. Let's ground ourselves in reality. What can you see, hear, and touch around you right now?",
            "These obsessive thoughts are like a false alarm in your brain. They feel urgent, but they don't require immediate action. How can we challenge this thought together?"
          ]
        : [
            "I can hear that you're in distress. You're not alone in this feeling.",
            "This intense emotion will pass. You've gotten through difficult moments before.",
            "Let's focus on the present moment. You are safe where you are right now.",
            "Your feelings are valid, and it's okay to feel overwhelmed sometimes."
          ];

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const startDistractionActivity = (activity: string) => {
    setDistractionActivity(activity);
    setTimeout(() => {
      setDistractionActivity(null);
    }, 60000); // 1 minute activity
  };

  const toggleWorkMode = () => {
    setWorkModeActive(!workModeActive);
  };

  const resetToSelection = () => {
    setCurrentMode('selection');
    setMessages([]);
    setInputMessage('');
    setDistractionActivity(null);
    setWorkModeActive(false);
  };

  // Work Mode Overlay Component
  const WorkModeOverlay = () => {
    if (!workModeActive) return null;

    return (
      <motion.div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md mx-4 text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
        >
          <div className="space-y-6">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mx-auto flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Focus Mode Active</h3>
              <p className="text-muted-foreground">
                Take three deep breaths and return to your current task. 
                You have the strength to redirect your attention.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={toggleWorkMode} className="flex-1">
                I'm Ready
              </Button>
              <Button variant="ghost" onClick={resetToSelection}>
                Need More Help
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Distraction Activities Component
  const DistractionActivity = () => {
    if (!distractionActivity) return null;

    const activities = {
      "5-4-3-2-1": {
        icon: <Eye className="w-8 h-8" />,
        title: "5-4-3-2-1 Grounding",
        content: (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Name these around you:</p>
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">5</Badge>
                <span>Things you can SEE</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">4</Badge>
                <span>Things you can TOUCH</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">3</Badge>
                <span>Things you can HEAR</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">2</Badge>
                <span>Things you can SMELL</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">1</Badge>
                <span>Thing you can TASTE</span>
              </div>
            </div>
          </div>
        )
      },
      "breathing": {
        icon: <Waves className="w-8 h-8" />,
        title: "Box Breathing",
        content: (
          <div className="space-y-4">
            <div className="relative w-32 h-32 mx-auto">
              <motion.div
                className="absolute inset-0 border-4 border-blue-500 rounded-lg"
                animate={{
                  scale: [1, 1.2, 1.2, 1, 1],
                  rotate: [0, 0, 0, 0, 0]
                }}
                transition={{
                  duration: 16,
                  repeat: Infinity,
                  times: [0, 0.25, 0.5, 0.75, 1]
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="text-center"
                  animate={{
                    opacity: [1, 1, 1, 1, 1]
                  }}
                  transition={{
                    duration: 16,
                    repeat: Infinity,
                    times: [0, 0.25, 0.5, 0.75, 1]
                  }}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1, 1, 1, 1]
                    }}
                    transition={{
                      duration: 16,
                      repeat: Infinity,
                      times: [0, 0.25, 0.5, 0.75, 1]
                    }}
                  >
                    Breathe
                  </motion.div>
                </motion.div>
              </div>
            </div>
            <p className="text-sm text-center">4 seconds in • 4 seconds hold • 4 seconds out • 4 seconds hold</p>
          </div>
        )
      },
      "colors": {
        icon: <Target className="w-8 h-8" />,
        title: "Color Hunt",
        content: (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Find objects around you in these colors:</p>
            <div className="grid grid-cols-3 gap-3">
              {['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange'].map((color) => (
                <motion.div
                  key={color}
                  className={`p-3 rounded-lg text-white text-center cursor-pointer`}
                  style={{ 
                    backgroundColor: color.toLowerCase() === 'yellow' ? '#EAB308' : 
                                   color.toLowerCase() === 'purple' ? '#A855F7' :
                                   color.toLowerCase()
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-xs font-medium">{color}</div>
                </motion.div>
              ))}
            </div>
          </div>
        )
      }
    };

    const activity = activities[distractionActivity as keyof typeof activities];

    return (
      <motion.div
        className="fixed inset-0 bg-black/30 backdrop-blur-md z-40 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-background rounded-2xl p-8 shadow-2xl max-w-md w-full text-center border"
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
        >
          <div className="space-y-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto flex items-center justify-center text-primary">
              {activity.icon}
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">{activity.title}</h3>
              {activity.content}
            </div>
            <Button onClick={() => setDistractionActivity(null)} className="w-full">
              I Feel Better
            </Button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <>
      <div className="support-dashboard h-screen bg-gradient-to-br from-background via-background/95 to-muted/20 overflow-y-auto">
        <div className="container max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-2">
              <Link href="/dashboard" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-500" />
                <h1 className="text-3xl lg:text-4xl font-extralight tracking-wide">
                  <ShinyText text="Immediate Support" disabled={false} speed={4} className="text-3xl lg:text-4xl font-extralight" />
                </h1>
              </div>
              <p className="text-muted-foreground">
                Get immediate help when you're feeling overwhelmed
              </p>
            </div>
            {currentMode !== 'selection' && (
              <Button variant="outline" onClick={resetToSelection}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Change Mode
              </Button>
            )}
          </motion.div>

          {/* Mode Selection */}
          {currentMode === 'selection' && (
            <div className="max-w-4xl mx-auto">
              <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h2 className="text-2xl font-semibold mb-4">How can we help you right now?</h2>
                <p className="text-muted-foreground">Choose the type of support that best matches what you're experiencing.</p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Reassurance Mode */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Card className="h-full cursor-pointer group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-background dark:from-purple-900/20 dark:to-background">
                    <CardContent className="p-8 flex flex-col h-full">
                      <div className="flex-grow space-y-6">
                        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <MessageCircle className="w-8 h-8 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-purple-600 mb-3">Reassurance Mode</h3>
                          <p className="text-muted-foreground mb-4">
                            Choose this if you feel an urge because you're worried something bad might happen 
                            if you don't perform a ritual. This chat helps you challenge those "what if" thoughts with logic.
                          </p>
                          <div className="space-y-2">
                            <Badge variant="secondary" className="mr-2">Logical Support</Badge>
                            <Badge variant="secondary" className="mr-2">Thought Challenging</Badge>
                            <Badge variant="secondary">Evidence-Based</Badge>
                          </div>
                        </div>
                      </div>
                      <Button 
                        onClick={() => setCurrentMode('reassurance')}
                        className="w-full mt-6 bg-purple-600 hover:bg-purple-700"
                      >
                        Start Reassurance Chat
                        <MessageCircle className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* SOS Mode */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Card className="h-full cursor-pointer group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-red-50 to-background dark:from-red-900/20 dark:to-background">
                    <CardContent className="p-8 flex flex-col h-full">
                      <div className="flex-grow space-y-6">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Zap className="w-8 h-8 text-red-600" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-red-600 mb-3">SOS Mode</h3>
                          <p className="text-muted-foreground mb-4">
                            Choose this for urges that feel intense but don't have a clear logical reason. 
                            These tools are designed to quickly shift your focus and help you feel grounded.
                          </p>
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Badge variant="secondary" className="mr-2">Distraction Tools</Badge>
                              <Badge variant="secondary" className="mr-2">Grounding</Badge>
                              <Badge variant="secondary">Quick Relief</Badge>
                            </div>
                            <div className="grid grid-cols-1 gap-2 mt-4">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setCurrentMode('sos-distract')}
                                className="justify-start group-hover:border-red-200"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Distract Me
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setCurrentMode('sos-work')}
                                className="justify-start group-hover:border-red-200"
                              >
                                <Monitor className="w-4 h-4 mr-2" />
                                Work Mode
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          )}

          {/* Reassurance Chat Mode */}
          {currentMode === 'reassurance' && (
            <motion.div
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-gradient-to-br from-purple-50 via-background to-purple-50/50 dark:from-purple-900/10 dark:via-background dark:to-purple-900/5 rounded-2xl border shadow-2xl overflow-hidden">
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-6 h-6" />
                    <div>
                      <h2 className="text-xl font-bold">Reassurance Chat</h2>
                      <p className="text-purple-100 text-sm">Let's work through this logically together</p>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="h-[400px] overflow-y-auto p-6 space-y-4 bg-white/50 dark:bg-gray-900/20">
                  {messages.length === 0 && (
                    <div className="text-center py-8">
                      <Heart className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        I'm here to help you think through this logically. 
                        What obsessive thought is bothering you right now?
                      </p>
                    </div>
                  )}
                  
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] p-4 rounded-2xl ${
                        message.type === 'user' 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-white dark:bg-gray-800 border shadow-sm'
                      }`}>
                        <p>{message.content}</p>
                      </div>
                    </motion.div>
                  ))}

                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white dark:bg-gray-800 border p-4 rounded-2xl">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-6 border-t bg-white/80 dark:bg-gray-900/40">
                  <div className="flex gap-3">
                    <Textarea
                      placeholder="Tell me what's worrying you..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                      className="min-h-[60px] resize-none"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isTyping}
                      className="px-6"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* SOS Distraction Mode */}
          {currentMode === 'sos-distract' && (
            <motion.div
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="border-0 shadow-2xl bg-gradient-to-br from-red-50 via-background to-orange-50 dark:from-red-900/10 dark:to-orange-900/10">
                <CardHeader className="text-center pb-8">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto flex items-center justify-center mb-4">
                    <Zap className="w-8 h-8 text-red-600" />
                  </div>
                  <CardTitle className="text-2xl text-red-600">SOS - Distraction Mode</CardTitle>
                  <p className="text-muted-foreground">Quick distraction tools to shift your focus</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Grounding Exercise */}
                    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => startDistractionActivity('5-4-3-2-1')}>
                      <CardContent className="p-6 text-center">
                        <Eye className="w-10 h-10 text-blue-500 mx-auto mb-3" />
                        <h3 className="font-semibold mb-2">5-4-3-2-1 Grounding</h3>
                        <p className="text-sm text-muted-foreground">Focus on your senses to ground yourself in the present moment</p>
                      </CardContent>
                    </Card>

                    {/* Breathing Exercise */}
                    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => startDistractionActivity('breathing')}>
                      <CardContent className="p-6 text-center">
                        <Waves className="w-10 h-10 text-green-500 mx-auto mb-3" />
                        <h3 className="font-semibold mb-2">Box Breathing</h3>
                        <p className="text-sm text-muted-foreground">Calm your nervous system with guided breathing</p>
                      </CardContent>
                    </Card>

                    {/* Color Hunt */}
                    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => startDistractionActivity('colors')}>
                      <CardContent className="p-6 text-center">
                        <Target className="w-10 h-10 text-purple-500 mx-auto mb-3" />
                        <h3 className="font-semibold mb-2">Color Hunt</h3>
                        <p className="text-sm text-muted-foreground">Find objects of different colors around you</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Emergency Contacts */}
                  <div className="bg-muted/30 rounded-xl p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Phone className="w-5 h-5 text-red-500" />
                      Need Immediate Professional Help?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Crisis Text Line</p>
                        <p className="text-muted-foreground">Text HOME to 741741</p>
                      </div>
                      <div>
                        <p className="font-medium">National Suicide Prevention Lifeline</p>
                        <p className="text-muted-foreground">988 or 1-800-273-8255</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* SOS Work Mode */}
          {currentMode === 'sos-work' && (
            <motion.div
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="border-0 shadow-2xl bg-gradient-to-br from-blue-50 via-background to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10">
                <CardHeader className="text-center pb-8">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mx-auto flex items-center justify-center mb-4">
                    <Monitor className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl text-blue-600">Work Focus Mode</CardTitle>
                  <p className="text-muted-foreground">Redirect your attention back to productive activities</p>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-8">
                      <h3 className="text-xl font-semibold mb-4">Ready to Refocus?</h3>
                      <p className="text-muted-foreground mb-6">
                        Work Mode will create a gentle overlay reminder to help you stay focused on your current task. 
                        This helps redirect obsessive thoughts toward productive activity.
                      </p>
                      
                      <div className="space-y-4">
                        <Button 
                          onClick={toggleWorkMode}
                          size="lg"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Monitor className="w-5 h-5 mr-2" />
                          Activate Work Mode
                        </Button>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 text-left">
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                            <h4 className="font-medium mb-2">💡 Focus Tips</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• Start with a small, manageable task</li>
                              <li>• Set a timer for 25 minutes (Pomodoro)</li>
                              <li>• Keep your hands busy</li>
                            </ul>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                            <h4 className="font-medium mb-2">🎯 Suggested Activities</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• Organize your workspace</li>
                              <li>• Write in a journal</li>
                              <li>• Complete a puzzle or game</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      {/* Overlays */}
      <AnimatePresence>
        {distractionActivity && <DistractionActivity />}
        {workModeActive && <WorkModeOverlay />}
      </AnimatePresence>
    </>
  );
}
