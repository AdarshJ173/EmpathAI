"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { 
  ArrowLeft, 
  Heart, 
  Plus, 
  Play, 
  Pause, 
  RotateCcw,
  Target,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Timer,
  Waves,
  Star,
  Trophy,
  ChevronRight
} from "lucide-react";
import ShinyText from "@/components/ShinyText";
import PremiumLoader from "@/components/PremiumLoader";

interface Challenge {
  id: number;
  text: string;
  rating: number;
  completed: boolean;
  attempts: number;
  bestTime: number;
}

export default function ERPSupportCenter() {
  const [challenges, setChallenges] = useState<Challenge[]>([
    { id: 1, text: "Avoid pavement cracks", rating: 3, completed: true, attempts: 5, bestTime: 60 },
    { id: 2, text: "Touch doorknob", rating: 6, completed: false, attempts: 2, bestTime: 45 },
    { id: 3, text: "Use public restroom", rating: 8, completed: false, attempts: 0, bestTime: 0 }
  ]);

  const [newChallenge, setNewChallenge] = useState("");
  const [newRating, setNewRating] = useState("5");
  const [activeSession, setActiveSession] = useState<Challenge | null>(null);
  const [sessionState, setSessionState] = useState<'prompt' | 'timer' | 'complete'>('prompt');
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showBeachScene, setShowBeachScene] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Supportive messages for during ERP sessions
  const supportiveMessages = [
    "Breathe deeply. You are in control.",
    "This feeling is temporary and it will pass.",
    "Stay present. Focus on what you can see and hear.",
    "You are stronger than this urge.",
    "Embrace the discomfort. It's a sign of growth.",
    "One moment at a time. You can do this.",
    "Let the anxious thoughts come and go like clouds."
  ];

  const [currentMessage, setCurrentMessage] = useState(supportiveMessages[0]);
  const [messageIndex, setMessageIndex] = useState(0);

  // Timer logic
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            setSessionState('complete');
            setShowBeachScene(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTimerRunning, timeLeft]);

  // Supportive message rotation
  useEffect(() => {
    if (isTimerRunning) {
      const messageInterval = setInterval(() => {
        setMessageIndex(prev => {
          const next = (prev + 1) % supportiveMessages.length;
          setCurrentMessage(supportiveMessages[next]);
          return next;
        });
      }, 8000);

      return () => clearInterval(messageInterval);
    }
  }, [isTimerRunning]);

  const getRatingColor = (rating: number) => {
    const colors = [
      'from-green-400 to-green-600',
      'from-green-400 to-green-600', 
      'from-green-400 to-green-600',
      'from-yellow-400 to-orange-500',
      'from-yellow-400 to-orange-500',
      'from-orange-400 to-red-500',
      'from-orange-400 to-red-500',
      'from-red-400 to-red-600',
      'from-red-400 to-red-600',
      'from-red-500 to-red-700'
    ];
    return colors[Math.min(rating - 1, 9)] || colors[4];
  };

  const addChallenge = () => {
    if (newChallenge.trim()) {
      const newId = Math.max(...challenges.map(c => c.id), 0) + 1;
      setChallenges([...challenges, {
        id: newId,
        text: newChallenge.trim(),
        rating: parseInt(newRating),
        completed: false,
        attempts: 0,
        bestTime: 0
      }]);
      setNewChallenge("");
      setNewRating("5");
    }
  };

  const startSession = (challenge: Challenge) => {
    setActiveSession(challenge);
    setSessionState('prompt');
    setTimeLeft(60);
    setCurrentMessage(supportiveMessages[0]);
    setMessageIndex(0);
  };

  const beginTimer = () => {
    setSessionState('timer');
    setShowBeachScene(true);
    setIsTimerRunning(true);
  };

  const exitSession = () => {
    setActiveSession(null);
    setSessionState('prompt');
    setIsTimerRunning(false);
    setShowBeachScene(false);
    setTimeLeft(60);
  };

  const completeSession = () => {
    if (activeSession) {
      const updatedChallenges = challenges.map(challenge => {
        if (challenge.id === activeSession.id) {
          return {
            ...challenge,
            attempts: challenge.attempts + 1,
            bestTime: Math.max(challenge.bestTime, 60 - timeLeft),
            completed: timeLeft === 0 // Only mark as completed if full timer finished
          };
        }
        return challenge;
      });
      setChallenges(updatedChallenges);
    }
    exitSession();
  };

  const sortedChallenges = [...challenges].sort((a, b) => a.rating - b.rating);
  const nextChallenge = sortedChallenges.find(c => !c.completed);
  const progress = (challenges.filter(c => c.completed).length / challenges.length) * 100;

  if (activeSession) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
        {/* Beach Scene Background */}
        {showBeachScene && (
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-700 via-orange-400 to-yellow-500 opacity-80">
              {/* Stars */}
              <div className="absolute top-0 left-0 w-full h-1/2">
                {[...Array(30)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute bg-white rounded-full animate-pulse"
                    style={{
                      width: `${Math.random() * 3 + 1}px`,
                      height: `${Math.random() * 3 + 1}px`,
                      top: `${Math.random() * 50}%`,
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 5}s`,
                      animationDuration: `${Math.random() * 3 + 2}s`
                    }}
                  />
                ))}
              </div>
              
              {/* Buildings Silhouette */}
              <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 w-4/5 h-20 flex items-end gap-1">
                {[...Array(15)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-slate-800 opacity-70"
                    style={{ 
                      height: `${Math.random() * 80 + 20}%`,
                      width: `${100/15}%`
                    }}
                  />
                ))}
              </div>
              
              {/* Water with Waves */}
              <div className="absolute bottom-0 left-0 w-full h-1/4 overflow-hidden">
                <motion.div
                  className="absolute bottom-0 left-0 w-full h-full bg-blue-400 opacity-50"
                  animate={{ 
                    transform: ["translateY(0px)", "translateY(-20px)", "translateY(0px)"],
                    scaleX: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 6, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                />
                <motion.div
                  className="absolute bottom-0 left-0 w-full h-full bg-blue-300 opacity-30"
                  animate={{ 
                    transform: ["translateY(10px)", "translateY(-30px)", "translateY(10px)"],
                    scaleX: [1.1, 1, 1.1]
                  }}
                  transition={{ 
                    duration: 8, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 2
                  }}
                />
              </div>
              
              {/* Shore */}
              <div className="absolute bottom-0 left-0 w-full h-1/4 bg-yellow-200 opacity-60" />
            </div>
          </div>
        )}

        {/* Session Content */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 text-white">
          {/* Exit Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={exitSession}
            className="absolute top-4 left-4 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit Session
          </Button>

          {/* Session Content */}
          <div className="text-center space-y-8 max-w-lg">
            {sessionState === 'prompt' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <h2 className="text-4xl font-bold">
                  It's time. Please {activeSession.text.toLowerCase()}.
                </h2>
                <Button 
                  onClick={beginTimer}
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-white/90 font-bold px-8 py-3 text-lg rounded-full"
                >
                  I've Started
                </Button>
              </motion.div>
            )}

            {sessionState === 'timer' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {/* Timer Circle */}
                <div className="relative w-48 h-48 mx-auto">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="white"
                      strokeWidth="4"
                      fill="none"
                      opacity="0.3"
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="white"
                      strokeWidth="4"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - timeLeft / 60)}`}
                      transition={{ duration: 1, ease: "linear" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold">{timeLeft}</span>
                  </div>
                </div>

                {/* Supportive Message */}
                <motion.div
                  key={messageIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="min-h-[60px] flex items-center justify-center"
                >
                  <p className="text-xl font-medium text-center">{currentMessage}</p>
                </motion.div>

                {/* Pause/Resume Button */}
                <Button
                  variant="ghost"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="text-white hover:bg-white/20"
                >
                  {isTimerRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isTimerRunning ? 'Pause' : 'Resume'}
                </Button>
              </motion.div>
            )}

            {sessionState === 'complete' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <Trophy className="w-16 h-16 mx-auto text-yellow-400" />
                  <h2 className="text-4xl font-bold">You did it!</h2>
                  <p className="text-lg">
                    You successfully held on for {60 - timeLeft} seconds.
                    {timeLeft === 0 && " Congratulations on completing the full session!"}
                  </p>
                </div>
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={completeSession}
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-white/90 font-bold px-8 py-3 text-lg rounded-full"
                  >
                    Complete Session
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSessionState('prompt');
                      setTimeLeft(60);
                      setShowBeachScene(false);
                    }}
                    className="text-white hover:bg-white/20"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="erp-dashboard h-screen bg-gradient-to-br from-background via-background/95 to-muted/20 overflow-y-auto">
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
              <Heart className="w-8 h-8 text-purple-500" />
              <h1 className="text-3xl lg:text-4xl font-extralight tracking-wide">
                <ShinyText text="ERP Support Center" disabled={false} speed={4} className="text-3xl lg:text-4xl font-extralight" />
              </h1>
            </div>
            <p className="text-muted-foreground">
              Structured exposure therapy with timed delays to build resistance
            </p>
          </div>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 via-background to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-500" />
                    <h3 className="font-semibold">Overall Progress</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Completed Challenges</span>
                      <span>{challenges.filter(c => c.completed).length}/{challenges.length}</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <h3 className="font-semibold">Success Stats</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-500">
                        {challenges.reduce((sum, c) => sum + c.attempts, 0)}
                      </div>
                      <div className="text-xs text-muted-foreground">Total Attempts</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-500">
                        {Math.max(...challenges.map(c => c.bestTime), 0)}s
                      </div>
                      <div className="text-xs text-muted-foreground">Best Time</div>
                    </div>
                  </div>
                </div>

                {nextChallenge && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-orange-500" />
                      <h3 className="font-semibold">Recommended Next</h3>
                    </div>
                    <div className="p-4 bg-background/50 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{nextChallenge.text}</span>
                        <div className={`px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getRatingColor(nextChallenge.rating)} text-white`}>
                          {nextChallenge.rating}
                        </div>
                      </div>
                      <Button 
                        onClick={() => startSession(nextChallenge)}
                        size="sm" 
                        className="w-full"
                      >
                        Start Challenge
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Challenge Hierarchy */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-500" />
                  Your Challenge Pyramid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sortedChallenges.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8 italic">
                      Your pyramid is empty. Add a challenge to begin.
                    </p>
                  ) : (
                    sortedChallenges.map((challenge, index) => (
                      <motion.div
                        key={challenge.id}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
                          challenge.completed 
                            ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' 
                            : index === 0 
                              ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 ring-2 ring-blue-200 dark:ring-blue-800' 
                              : 'border-border bg-background hover:border-border/50'
                        }`}
                        style={{ 
                          width: `${90 - index * 10}%`,
                          margin: '0 auto'
                        }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        onClick={() => startSession(challenge)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-r ${getRatingColor(challenge.rating)}`}>
                              {challenge.rating}
                            </div>
                            <span className={`font-medium ${challenge.completed ? 'line-through opacity-60' : ''}`}>
                              {challenge.text}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {index === 0 && !challenge.completed && (
                              <span className="text-xs font-bold text-blue-500 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                                NEXT UP
                              </span>
                            )}
                            {challenge.completed && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                            {challenge.attempts > 0 && (
                              <div className="text-xs text-muted-foreground">
                                {challenge.attempts} attempts
                              </div>
                            )}
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Add New Challenge */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-green-500" />
                  Add New Challenge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="challenge-text">Challenge Description</Label>
                    <Input
                      id="challenge-text"
                      placeholder="e.g., Use a public restroom"
                      value={newChallenge}
                      onChange={(e) => setNewChallenge(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="anxiety-rating">Anxiety Rating (1-10)</Label>
                    <Select value={newRating} onValueChange={setNewRating}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10].map(num => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num <= 3 ? '(Low)' : num <= 6 ? '(Medium)' : '(High)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={addChallenge} 
                    className="w-full"
                    disabled={!newChallenge.trim()}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Pyramid
                  </Button>
                </div>

                {/* Tips */}
                <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-500" />
                    ERP Tips
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Start with lower anxiety ratings and work your way up</li>
                    <li>• The goal is to delay the compulsion, not eliminate anxiety</li>
                    <li>• Consistency is more important than perfection</li>
                    <li>• Celebrate small victories along the way</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
