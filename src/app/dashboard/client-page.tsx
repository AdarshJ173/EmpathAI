"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  AlertTriangle, 
  Stethoscope, 
  TrendingUp, 
  Clock, 
  Calendar,
  Award,
  Target,
  Zap,
  Shield,
  Activity,
  Users,
  BarChart3,
  MessageCircle,
  Settings,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import ShinyText from "@/components/ShinyText";
import PremiumLoader from "@/components/PremiumLoader";

export default function ClientDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [wellnessScore, setWellnessScore] = useState(82);
  const [currentStreak, setCurrentStreak] = useState(7);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Sample data for wellness metrics
  const wellnessData = {
    dailyGoals: {
      completed: 3,
      total: 5,
      percentage: 60
    },
    weeklyProgress: [
      { day: 'Mon', score: 75 },
      { day: 'Tue', score: 82 },
      { day: 'Wed', score: 78 },
      { day: 'Thu', score: 85 },
      { day: 'Fri', score: 89 },
      { day: 'Sat', score: 82 },
      { day: 'Sun', score: 82 }
    ],
    recentAchievements: [
      { title: '7-Day Streak', icon: '🔥', date: 'Today' },
      { title: 'ERP Progress', icon: '🎯', date: 'Yesterday' },
      { title: 'Mindful Moments', icon: '🧘', date: '2 days ago' }
    ]
  };

  const quickActions = [
    {
      id: 'erp-support',
      title: 'ERP Support Center',
      description: 'Continue your structured exposure therapy journey',
      icon: Heart,
      href: '/dashboard/erp-support',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      id: 'immediate-support',
      title: 'Immediate Support',
      description: 'Access crisis support and coping tools',
      icon: AlertTriangle,
      href: '/dashboard/immediate-support',
      color: 'from-red-500 to-orange-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-600 dark:text-red-400'
    },
    {
      id: 'therapist-portal',
      title: 'Therapist Portal',
      description: 'View professional insights and progress reports',
      icon: Stethoscope,
      href: '/dashboard/therapist-portal',
      color: 'from-green-500 to-teal-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      id: 'ai-companion',
      title: 'AI Companion Chat',
      description: 'Continue your conversation with EmpathAI',
      icon: MessageCircle,
      href: '/',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400'
    }
  ];

  if (loading) {
    return <PremiumLoader message="Loading your wellness dashboard" />;
  }

  return (
    <div className="dashboard-page h-screen bg-gradient-to-br from-background via-background/95 to-muted/20 overflow-y-auto overflow-x-hidden">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl lg:text-4xl font-extralight tracking-wide">
                <ShinyText text="Wellness Dashboard" disabled={false} speed={4} className="text-3xl lg:text-4xl font-extralight" />
              </h1>
              <Sparkles className="w-6 h-6 text-primary/60" />
            </div>
            <p className="text-muted-foreground">Good evening, Alex. Here's how you're doing today.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => router.push('/')}>
              <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
              Home
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Wellness Score Hero Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-primary/5 via-background to-muted/20">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10" />
            <CardContent className="relative p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                {/* Wellness Score Circle */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-32 h-32 relative">
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="none"
                          className="text-muted/20"
                        />
                        <motion.circle
                          cx="50"
                          cy="50"
                          r="45"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="none"
                          strokeLinecap="round"
                          className="text-primary"
                          strokeDasharray={`${2 * Math.PI * 45}`}
                          strokeDashoffset={`${2 * Math.PI * 45 * (1 - wellnessScore / 100)}`}
                          initial={{ strokeDashoffset: `${2 * Math.PI * 45}` }}
                          animate={{ strokeDashoffset: `${2 * Math.PI * 45 * (1 - wellnessScore / 100)}` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold text-primary">{wellnessScore}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-lg">Daily Wellness Score</p>
                    <p className="text-sm text-muted-foreground">+5 from yesterday</p>
                  </div>
                </div>

                {/* Progress Insights */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      Great Progress!
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      You're maintaining excellent consistency with your ERP exercises and showing improved emotional regulation. 
                      Your mindfulness sessions have increased by 40% this week.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium flex items-center gap-2">
                          <Target className="w-4 h-4 text-blue-500" />
                          Daily Goals
                        </span>
                        <span className="text-sm text-muted-foreground">{wellnessData.dailyGoals.completed}/{wellnessData.dailyGoals.total}</span>
                      </div>
                      <Progress value={wellnessData.dailyGoals.percentage} className="h-2" />
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium flex items-center gap-2">
                          <Zap className="w-4 h-4 text-orange-500" />
                          Current Streak
                        </span>
                        <span className="text-sm font-bold text-orange-500">{currentStreak} days</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
                onHoverStart={() => setHoveredCard(action.id)}
                onHoverEnd={() => setHoveredCard(null)}
              >
                <Link href={action.href}>
                  <Card className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-0 ${action.bgColor}`}>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className={`p-3 rounded-xl ${action.bgColor} ${action.textColor}`}>
                            <action.icon className="w-6 h-6" />
                          </div>
                          <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${hoveredCard === action.id ? 'translate-x-1 text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                          <h3 className={`font-semibold text-lg group-hover:${action.textColor} transition-colors`}>
                            {action.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-2">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats & Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Weekly Progress */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Weekly Wellness Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {wellnessData.weeklyProgress.map((day, index) => (
                    <div key={day.day} className="flex items-center gap-4">
                      <span className="text-sm font-medium w-8">{day.day}</span>
                      <div className="flex-1">
                        <Progress value={day.score} className="h-3" />
                      </div>
                      <span className="text-sm font-bold w-8">{day.score}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Achievements */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {wellnessData.recentAchievements.map((achievement, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                    >
                      <span className="text-2xl">{achievement.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium">{achievement.title}</p>
                        <p className="text-sm text-muted-foreground">{achievement.date}</p>
                      </div>
                      <Sparkles className="w-4 h-4 text-primary" />
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
