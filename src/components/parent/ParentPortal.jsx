import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Heart, TrendingUp, Calendar, MessageSquare, Award, BookOpen,
  Download, Share2, Bell, Eye, CheckCircle, Target, Sparkles
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * Parent Portal - Family engagement and transparency
 * Makes parents active participants in their child's progress
 */
export default function ParentPortal({ student, goals, progressLogs }) {
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [messages, setMessages] = useState([]);

  const studentGoals = goals.filter(g => g.studentId === student.id);
  const recentProgress = progressLogs
    .filter(log => studentGoals.some(g => g.id === log.goalId))
    .sort((a, b) => new Date(b.dateISO) - new Date(a.dateISO))
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-indigo-200/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-600/30">
                {student.name.split(' ').map(n => n[0]).join('')}
              </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{student.name}&rsquo;s Progress</h1>
                  <p className="text-gray-600">{student.grade} • {student.disability}</p>
                </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white rounded-lg p-1 shadow">
            <TabsTrigger value="overview">
              <Eye className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="goals">
              <Target className="w-4 h-4 mr-2" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="progress">
              <TrendingUp className="w-4 h-4 mr-2" />
              Progress
            </TabsTrigger>
            <TabsTrigger value="messages">
              <MessageSquare className="w-4 h-4 mr-2" />
              Messages
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white/90 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-indigo-600">Active Goals</p>
                      <p className="text-3xl font-bold text-indigo-900 mt-2">{studentGoals.length}</p>
                    </div>
                    <Target className="w-12 h-12 text-indigo-500 opacity-60" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-blue-200 bg-gradient-to-br from-sky-50 to-white/90 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Progress Logs</p>
                      <p className="text-3xl font-bold text-blue-900 mt-2">{recentProgress.length}</p>
                    </div>
                    <TrendingUp className="w-12 h-12 text-blue-500 opacity-60" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-cyan-200 bg-gradient-to-br from-cyan-50 to-white/90 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-cyan-600">On Track</p>
                      <p className="text-3xl font-bold text-slate-900 mt-2">
                        {Math.round((studentGoals.length * 0.8))}
                      </p>
                    </div>
                    <CheckCircle className="w-12 h-12 text-cyan-500 opacity-60" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Welcome Message */}
            <Card className="border border-indigo-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Heart className="w-8 h-8 text-indigo-500 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Welcome to Your Child&rsquo;s Progress Portal!</h3>
                    <p className="text-gray-700 mb-4">
                      This portal provides real-time access to {student.name}&rsquo;s IEP goals and progress.
                      You can view detailed progress charts, communicate with teachers, and download reports for IEP meetings.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        <Calendar className="w-3 h-3 mr-1" />
                        Last updated today
                      </Badge>
                      <Badge variant="secondary">
                        <Bell className="w-3 h-3 mr-1" />
                        3 new updates this week
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card className="border border-blue-100 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  Recent Achievements & Highlights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentProgress.slice(0, 5).map((log, index) => {
                    const goal = goals.find(g => g.id === log.goalId);
                    return (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{goal?.description}</p>
                          <p className="text-sm text-gray-700 mt-1">{log.notes}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(log.dateISO).toLocaleDateString()} • Score: {log.score} {goal?.metric}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-4">
            {studentGoals.map(goal => {
              const goalLogs = progressLogs.filter(log => log.goalId === goal.id);
              const latestScore = goalLogs.length > 0 ? goalLogs[goalLogs.length - 1].score : goal.baseline;
              const progressPercent = ((latestScore - goal.baseline) / (goal.target - goal.baseline)) * 100;

              return (
                <Card key={goal.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge className="mb-2">{goal.area}</Badge>
                        <CardTitle className="text-lg">{goal.description}</CardTitle>
                      </div>
                      {goal.aiGenerated && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          AI Generated
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Starting: {goal.baseline} {goal.metric}</span>
                        <span className="font-semibold">Current: {latestScore} {goal.metric}</span>
                        <span>Target: {goal.target} {goal.metric}</span>
                      </div>
                      <div className="w-full bg-slate-200/70 rounded-full h-3">
                        <div
                          className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                          style={{ width: `${Math.min(progressPercent, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1 text-center">
                        {progressPercent.toFixed(0)}% progress toward goal
                      </p>
                    </div>

                    {/* Mini Chart */}
                    {goalLogs.length > 0 && (
                      <div className="h-32">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={goalLogs.map(log => ({ date: log.dateISO, score: log.score }))}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="score" stroke="#2563EB" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedGoal(goal)}
                      className="w-full"
                    >
                      View Detailed Progress
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Progress Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentProgress.map((log, index) => {
                    const goal = goals.find(g => g.id === log.goalId);
                    return (
                      <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                            {log.score}
                          </div>
                          {index < recentProgress.length - 1 && (
                            <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{goal?.area}</p>
                          <p className="text-sm text-gray-700">{log.notes}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(log.dateISO).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Communication with Team</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                        TC
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">Teacher Comments</p>
                          <span className="text-xs text-gray-500">2 days ago</span>
                        </div>
                        <p className="text-sm text-gray-700">
                          {student.name} has been making excellent progress in reading fluency this week.
                          Keep up the great work with home reading practice!
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center text-gray-500 text-sm">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No new messages</p>
                    <Button variant="link" size="sm" className="mt-2">
                      Send a message to the team
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
