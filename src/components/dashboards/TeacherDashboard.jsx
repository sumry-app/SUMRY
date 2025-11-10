import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Users, Target, TrendingUp, AlertTriangle, CheckCircle, Clock,
  BarChart3, Calendar, MessageSquare, FileText, Award, Search
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * TeacherDashboard - Feature #2: Role-Based Dashboard (Teacher View)
 *
 * Comprehensive overview for special education teachers
 * Features: Caseload overview, progress monitoring, para oversight, reports
 */
export default function TeacherDashboard({
  students,
  goals,
  logs,
  assignments,
  paraStaff,
  onViewStudent,
  onViewGoal,
  onCreateReport
}) {
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate teacher metrics
  const metrics = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Student progress
    const activeStudents = students.filter(s => s.status === 'active').length;
    const totalGoals = goals.length;
    const activeGoals = goals.filter(g => g.status === 'active').length;

    // Progress tracking
    const weekLogs = logs.filter(log => log.dateISO >= weekAgo);
    const todayLogs = logs.filter(log => log.dateISO === today);

    // Goal progress analysis
    const goalsOnTrack = goals.filter(g => {
      const goalLogs = logs.filter(l => l.goalId === g.id);
      if (goalLogs.length < 3) return false;

      const recent = goalLogs.slice(-5);
      const avgScore = recent.reduce((sum, l) => sum + (l.stats?.accuracy || 0), 0) / recent.length;
      return avgScore >= (g.target || 80);
    }).length;

    const goalsAtRisk = goals.filter(g => {
      const goalLogs = logs.filter(l => l.goalId === g.id);
      if (goalLogs.length === 0) return true; // No data = at risk

      const recentWeek = goalLogs.filter(l => l.dateISO >= weekAgo);
      if (recentWeek.length === 0) return true; // No recent data

      const avgScore = recentWeek.reduce((sum, l) => sum + (l.stats?.accuracy || 0), 0) / recentWeek.length;
      return avgScore < 50;
    }).length;

    // Para performance
    const activeParas = paraStaff.filter(p => p.status === 'active').length;
    const paraPerformance = paraStaff.map(para => {
      const paraLogs = weekLogs.filter(log => log.paraId === para.id);
      return {
        id: para.id,
        name: para.name,
        sessionsThisWeek: paraLogs.length,
        avgAccuracy: paraLogs.length > 0
          ? Math.round(paraLogs.reduce((sum, l) => sum + (l.stats?.accuracy || 0), 0) / paraLogs.length)
          : 0
      };
    });

    return {
      activeStudents,
      totalGoals,
      activeGoals,
      goalsOnTrack,
      goalsAtRisk,
      weekLogs: weekLogs.length,
      todayLogs: todayLogs.length,
      activeParas,
      paraPerformance
    };
  }, [students, goals, logs, paraStaff]);

  // Students requiring attention
  const studentsNeedingAttention = useMemo(() => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return students
      .map(student => {
        const studentGoals = goals.filter(g => g.studentId === student.id);
        const studentLogs = logs.filter(l => l.studentId === student.id);
        const recentLogs = studentLogs.filter(l => l.dateISO >= weekAgo);

        const issueFlags = [];

        // Check for no recent data
        if (recentLogs.length === 0) {
          issueFlags.push({ type: 'warning', message: 'No data this week' });
        }

        // Check for declining performance
        if (recentLogs.length >= 3) {
          const recent3 = recentLogs.slice(-3);
          const scores = recent3.map(l => l.stats?.accuracy || 0);
          if (scores[0] > scores[2] + 15) {
            issueFlags.push({ type: 'alert', message: 'Declining performance' });
          }
        }

        // Check for goals at risk
        const atRiskGoals = studentGoals.filter(g => {
          const goalLogs = studentLogs.filter(l => l.goalId === g.id && l.dateISO >= weekAgo);
          const avgScore = goalLogs.reduce((sum, l) => sum + (l.stats?.accuracy || 0), 0) / (goalLogs.length || 1);
          return avgScore < 50;
        }).length;

        if (atRiskGoals > 0) {
          issueFlags.push({ type: 'alert', message: `${atRiskGoals} goal(s) at risk` });
        }

        return {
          ...student,
          issueFlags,
          recentDataPoints: recentLogs.length,
          atRiskGoals
        };
      })
      .filter(s => s.issueFlags.length > 0)
      .sort((a, b) => b.issueFlags.length - a.issueFlags.length);
  }, [students, goals, logs]);

  // Progress trend data
  const progressTrendData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayLogs = logs.filter(l => l.dateISO === dateStr);

      days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        sessions: dayLogs.length,
        avgAccuracy: dayLogs.length > 0
          ? Math.round(dayLogs.reduce((sum, l) => sum + (l.stats?.accuracy || 0), 0) / dayLogs.length)
          : 0
      });
    }
    return days;
  }, [logs]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="text-gray-600">Caseload overview and progress monitoring</p>
        </div>
        <Button onClick={onCreateReport} className="bg-blue-600 hover:bg-blue-700">
          <FileText className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {metrics.activeStudents}
                </div>
                <div className="text-xs text-gray-600 mt-1">Active Students</div>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {metrics.activeGoals}
                </div>
                <div className="text-xs text-gray-600 mt-1">Active Goals</div>
              </div>
              <Target className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {metrics.goalsOnTrack}
                </div>
                <div className="text-xs text-gray-600 mt-1">On Track</div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {metrics.goalsAtRisk}
                </div>
                <div className="text-xs text-gray-600 mt-1">At Risk</div>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {metrics.todayLogs}
                </div>
                <div className="text-xs text-gray-600 mt-1">Today's Sessions</div>
              </div>
              <Clock className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Trends */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            7-Day Progress Trend
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={progressTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="sessions"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Sessions"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgAccuracy"
                stroke="#10b981"
                strokeWidth={2}
                name="Avg Accuracy %"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Students Needing Attention */}
      {studentsNeedingAttention.length > 0 && (
        <Card className="border-2 border-orange-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Students Needing Attention ({studentsNeedingAttention.length})
            </h3>
            <div className="space-y-3">
              {studentsNeedingAttention.slice(0, 5).map(student => (
                <Card key={student.id} className="bg-orange-50">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-gray-900 mb-2">
                          {student.name}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {student.issueFlags.map((flag, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className={
                                flag.type === 'alert'
                                  ? 'bg-red-100 text-red-700 border-red-300'
                                  : 'bg-yellow-100 text-yellow-700 border-yellow-300'
                              }
                            >
                              {flag.message}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button
                        onClick={() => onViewStudent(student)}
                        size="sm"
                        variant="outline"
                      >
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Para Staff Performance */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            Para Staff Performance (This Week)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metrics.paraPerformance.map(para => (
              <Card key={para.id} className="bg-purple-50 border-purple-200">
                <CardContent className="pt-4 pb-4">
                  <div className="font-semibold text-gray-900 mb-2">
                    {para.name}
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {para.sessionsThisWeek}
                      </div>
                      <div className="text-xs text-gray-600">Sessions</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {para.avgAccuracy}%
                      </div>
                      <div className="text-xs text-gray-600">Avg Accuracy</div>
                    </div>
                  </div>
                </Card>
              </CardContent>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
