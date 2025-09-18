"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { 
  ArrowLeft, 
  Stethoscope, 
  Users,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Brain,
  Calendar,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  Eye,
  MessageSquare,
  Lightbulb,
  Download,
  Settings,
  Filter,
  Zap,
  Heart
} from "lucide-react";
import ShinyText from "@/components/ShinyText";
import PremiumLoader from "@/components/PremiumLoader";

interface Patient {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  lastActive: string;
  currentScore: number;
  scoreChange: number;
  status: 'active' | 'inactive' | 'concerning';
  totalSessions: number;
  completedChallenges: number;
  criticalAlerts: number;
}

interface SessionData {
  date: string;
  score: number;
  erp_sessions: number;
  support_requests: number;
  compulsions: number;
}

export default function TherapistPortal() {
  const [selectedPatient, setSelectedPatient] = useState<string>("alex_johnson");
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(true);

  // Sample patient data
  const patients: Patient[] = [
    {
      id: 'alex_johnson',
      name: 'Alex Johnson',
      email: 'alex.j@email.com',
      joinDate: '2024-01-15',
      lastActive: '2 hours ago',
      currentScore: 82,
      scoreChange: 5,
      status: 'active',
      totalSessions: 47,
      completedChallenges: 8,
      criticalAlerts: 0
    },
    {
      id: 'maria_garcia',
      name: 'Maria Garcia', 
      email: 'maria.g@email.com',
      joinDate: '2024-02-03',
      lastActive: '1 day ago',
      currentScore: 68,
      scoreChange: -3,
      status: 'concerning',
      totalSessions: 23,
      completedChallenges: 4,
      criticalAlerts: 2
    },
    {
      id: 'james_wilson',
      name: 'James Wilson',
      email: 'james.w@email.com', 
      joinDate: '2024-03-12',
      lastActive: '5 days ago',
      currentScore: 74,
      scoreChange: 8,
      status: 'inactive',
      totalSessions: 15,
      completedChallenges: 6,
      criticalAlerts: 0
    }
  ];

  // Sample session data for charts
  const generateSessionData = (patientId: string, days: number): SessionData[] => {
    const data: SessionData[] = [];
    const baseScores: Record<string, number> = {
      alex_johnson: 80,
      maria_garcia: 65,
      james_wilson: 72
    };
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const baseScore = baseScores[patientId] || 70;
      const variation = (Math.random() - 0.5) * 20;
      
      data.push({
        date: date.toISOString().split('T')[0],
        score: Math.max(0, Math.min(100, Math.round(baseScore + variation))),
        erp_sessions: Math.floor(Math.random() * 3),
        support_requests: Math.floor(Math.random() * 5),
        compulsions: Math.floor(Math.random() * 10)
      });
    }
    
    return data;
  };

  const currentPatient = patients.find(p => p.id === selectedPatient);
  const sessionData = generateSessionData(selectedPatient, timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90);
  
  const averageScore = sessionData.reduce((sum, day) => sum + day.score, 0) / sessionData.length;
  const totalERPSessions = sessionData.reduce((sum, day) => sum + day.erp_sessions, 0);
  const totalSupportRequests = sessionData.reduce((sum, day) => sum + day.support_requests, 0);
  const averageCompulsions = sessionData.reduce((sum, day) => sum + day.compulsions, 0) / sessionData.length;

  // AI Insights based on data patterns
  const generateAIInsights = () => {
    const insights = [];
    
    if (currentPatient) {
      if (currentPatient.scoreChange > 0) {
        insights.push({
          type: 'positive',
          text: `${currentPatient.name}'s wellness score has improved by ${currentPatient.scoreChange} points, indicating positive progress with their treatment plan.`
        });
      } else if (currentPatient.scoreChange < 0) {
        insights.push({
          type: 'warning',
          text: `${currentPatient.name}'s wellness score has declined by ${Math.abs(currentPatient.scoreChange)} points. Consider adjusting their treatment approach.`
        });
      }

      if (totalERPSessions > 15) {
        insights.push({
          type: 'positive', 
          text: `High engagement with ERP sessions (${totalERPSessions} sessions) correlates with improved anxiety tolerance.`
        });
      }

      if (averageCompulsions < 3) {
        insights.push({
          type: 'positive',
          text: `Significant reduction in compulsive behaviors (avg: ${averageCompulsions.toFixed(1)}/day) suggests effective coping strategy implementation.`
        });
      }

      if (totalSupportRequests > 20) {
        insights.push({
          type: 'neutral',
          text: `Frequent use of immediate support tools (${totalSupportRequests} requests) may indicate need for additional coping strategies.`
        });
      }

      if (currentPatient.status === 'concerning') {
        insights.push({
          type: 'warning',
          text: `Patient shows concerning patterns. Recommend scheduling an immediate check-in session.`
        });
      }
    }

    return insights;
  };

  const aiInsights = generateAIInsights();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <PremiumLoader message="Loading therapist portal" />;
  }

  return (
    <div className="therapist-portal h-screen bg-gradient-to-br from-background via-background/95 to-muted/20 overflow-y-auto">
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
              <Stethoscope className="w-8 h-8 text-green-500" />
              <h1 className="text-3xl lg:text-4xl font-extralight tracking-wide">
                <ShinyText text="Therapist Portal" disabled={false} speed={4} className="text-3xl lg:text-4xl font-extralight" />
              </h1>
            </div>
            <p className="text-muted-foreground">
              Monitor patient progress and gain data-driven insights
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Patient Overview Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {patients.map((patient, index) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
            >
              <Card 
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  selectedPatient === patient.id 
                    ? 'ring-2 ring-primary shadow-lg' 
                    : 'hover:shadow-md'
                } ${
                  patient.status === 'concerning' 
                    ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/10' 
                    : patient.status === 'inactive'
                    ? 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/10'
                    : ''
                }`}
                onClick={() => setSelectedPatient(patient.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{patient.name}</h3>
                      <p className="text-sm text-muted-foreground">{patient.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          patient.status === 'active' ? 'default' : 
                          patient.status === 'concerning' ? 'destructive' : 
                          'secondary'
                        }
                        className="text-xs"
                      >
                        {patient.status}
                      </Badge>
                      {patient.criticalAlerts > 0 && (
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Wellness Score</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{patient.currentScore}</span>
                        <div className={`flex items-center text-xs ${
                          patient.scoreChange > 0 ? 'text-green-600' : 
                          patient.scoreChange < 0 ? 'text-red-600' : 
                          'text-muted-foreground'
                        }`}>
                          {patient.scoreChange > 0 ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : patient.scoreChange < 0 ? (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          ) : null}
                          {patient.scoreChange !== 0 && Math.abs(patient.scoreChange)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Sessions:</span>
                        <span className="font-medium ml-2">{patient.totalSessions}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Challenges:</span>
                        <span className="font-medium ml-2">{patient.completedChallenges}</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Last active: {patient.lastActive}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Dashboard Content */}
        {currentPatient && (
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Patient Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  {currentPatient.name}
                  <Badge variant="outline" className="text-xs">
                    Patient ID: {currentPatient.id}
                  </Badge>
                </h2>
                <p className="text-muted-foreground">
                  Member since {new Date(currentPatient.joinDate).toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Select value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button size="sm">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Schedule Session
                </Button>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    Avg. Wellness Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round(averageScore)}</div>
                  <p className="text-xs text-muted-foreground">
                    {timeRange === '7d' ? 'Last 7 days' : timeRange === '30d' ? 'Last 30 days' : 'Last 90 days'}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-500" />
                    ERP Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalERPSessions}</div>
                  <p className="text-xs text-muted-foreground">
                    Total completed
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Zap className="w-4 h-4 text-red-500" />
                    Support Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalSupportRequests}</div>
                  <p className="text-xs text-muted-foreground">
                    Immediate support
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Brain className="w-4 h-4 text-orange-500" />
                    Avg. Compulsions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{averageCompulsions.toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground">
                    Per day
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts and Detailed Analysis */}
            <Tabs defaultValue="progress" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="progress">Progress Charts</TabsTrigger>
                <TabsTrigger value="patterns">Behavior Patterns</TabsTrigger>
                <TabsTrigger value="insights">AI Insights</TabsTrigger>
                <TabsTrigger value="sessions">Session History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="progress" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Wellness Score Trend */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        Wellness Score Trend
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {sessionData.slice(-7).map((day, index) => (
                          <div key={day.date} className="flex items-center gap-4">
                            <span className="text-sm w-20 text-muted-foreground">
                              {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                            </span>
                            <div className="flex-1">
                              <Progress value={day.score} className="h-3" />
                            </div>
                            <span className="text-sm font-bold w-8">{day.score}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Activity Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-500" />
                        Activity Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-purple-500" />
                            <span className="text-sm">ERP Sessions</span>
                          </div>
                          <span className="font-bold">{totalERPSessions}</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <span className="text-sm">Crisis Support Used</span>
                          </div>
                          <span className="font-bold">{totalSupportRequests}</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm">Challenges Completed</span>
                          </div>
                          <span className="font-bold">{currentPatient.completedChallenges}</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span className="text-sm">Active Days</span>
                          </div>
                          <span className="font-bold">
                            {sessionData.filter(d => d.erp_sessions > 0 || d.support_requests > 0).length}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="patterns" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Compulsion Frequency Pattern</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {sessionData.slice(-10).map((day) => (
                          <div key={day.date} className="flex items-center gap-3">
                            <span className="text-xs w-16 text-muted-foreground">
                              {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                            <div className="flex-1 flex items-center gap-1">
                              {Array.from({ length: Math.max(1, day.compulsions) }).map((_, i) => (
                                <div key={i} className="w-3 h-3 bg-orange-400 rounded-sm" />
                              ))}
                            </div>
                            <span className="text-xs font-medium w-4">{day.compulsions}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Support Usage Patterns</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Reassurance Mode</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-muted rounded-full h-2">
                              <div className="w-3/4 bg-purple-500 h-2 rounded-full"></div>
                            </div>
                            <span className="text-sm font-medium">75%</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">SOS - Distraction</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-muted rounded-full h-2">
                              <div className="w-1/2 bg-red-500 h-2 rounded-full"></div>
                            </div>
                            <span className="text-sm font-medium">50%</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">SOS - Work Mode</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-muted rounded-full h-2">
                              <div className="w-1/4 bg-blue-500 h-2 rounded-full"></div>
                            </div>
                            <span className="text-sm font-medium">25%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="insights" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                      AI-Generated Clinical Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {aiInsights.map((insight, index) => (
                        <motion.div
                          key={index}
                          className={`p-4 rounded-lg border-l-4 ${
                            insight.type === 'positive' 
                              ? 'bg-green-50 dark:bg-green-900/10 border-l-green-500' :
                            insight.type === 'warning'
                              ? 'bg-orange-50 dark:bg-orange-900/10 border-l-orange-500' :
                              'bg-blue-50 dark:bg-blue-900/10 border-l-blue-500'
                          }`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <p className="text-sm">{insight.text}</p>
                        </motion.div>
                      ))}
                      
                      {aiInsights.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No significant insights detected for this time period.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="sessions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Session History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {sessionData.slice(-10).reverse().map((day) => (
                        <div key={day.date} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-4">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">
                                {new Date(day.date).toLocaleDateString('en-US', { 
                                  weekday: 'long',
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Wellness Score: {day.score}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <Badge variant="outline" className="text-xs">
                              {day.erp_sessions} ERP
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {day.support_requests} Support
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {day.compulsions} Compulsions
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </div>
    </div>
  );
}
