import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users, Target, Activity, Shield, AlertTriangle, TrendingUp,
  BarChart3, Clock, CheckCircle, XCircle, Award, Database
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

/**
 * AdminDashboard - Feature #25: Admin Progress Dashboards
 *
 * System-wide analytics and oversight for administrators
 * Features: Usage analytics, compliance monitoring, district-wide metrics
 */
export default function AdminDashboard({
  students,
  goals,
  logs,
  users,
  auditLog,
  integrityAlerts
}) {
  // System-wide metrics
  const metrics = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // User statistics
    const activeUsers = users.filter(u => u.status === 'active').length;
    const teacherCount = users.filter(u => u.role === 'teacher').length;
    const paraCount = users.filter(u => u.role === 'para').length;

    // Student & Goal statistics
    const activeStudents = students.filter(s => s.status === 'active').length;
    const totalGoals = goals.length;

    // Data collection metrics
    const todayLogs = logs.filter(l => l.dateISO === today).length;
    const weekLogs = logs.filter(l => l.dateISO >= weekAgo).length;
    const monthLogs = logs.filter(l => l.dateISO >= monthAgo).length;

    // Calculate data collection rate
    const expectedWeeklyLogs = activeStudents * 5; // Assume 5 logs per student per week
    const collectionRate = expectedWeeklyLogs > 0
      ? Math.round((weekLogs / expectedWeeklyLogs) * 100)
      : 0;

    // Compliance metrics
    const studentsWithRecentData = students.filter(s => {
      const studentLogs = logs.filter(l => l.studentId === s.id && l.dateISO >= weekAgo);
      return studentLogs.length > 0;
    }).length;

    const complianceRate = activeStudents > 0
      ? Math.round((studentsWithRecentData / activeStudents) * 100)
      : 0;

    // Data integrity alerts
    const criticalAlerts = integrityAlerts?.filter(a => a.severity === 'critical' && !a.resolved).length || 0;
    const warningAlerts = integrityAlerts?.filter(a => a.severity === 'warning' && !a.resolved).length || 0;

    // User engagement
    const activeThisWeek = new Set(logs.filter(l => l.dateISO >= weekAgo).map(l => l.paraId || l.teacherId)).size;
    const engagementRate = activeUsers > 0
      ? Math.round((activeThisWeek / activeUsers) * 100)
      : 0;

    return {
      activeUsers,
      teacherCount,
      paraCount,
      activeStudents,
      totalGoals,
      todayLogs,
      weekLogs,
      monthLogs,
      collectionRate,
      complianceRate,
      criticalAlerts,
      warningAlerts,
      engagementRate
    };
  }, [students, goals, logs, users, integrityAlerts]);

  // Usage trends over last 30 days
  const usageTrends = useMemo(() => {
    const trends = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayLogs = logs.filter(l => l.dateISO === dateStr);
      const uniqueUsers = new Set(dayLogs.map(l => l.paraId || l.teacherId)).size;

      trends.push({
        date: date.getDate(),
        sessions: dayLogs.length,
        users: uniqueUsers
      });
    }
    return trends;
  }, [logs]);

  // User role distribution
  const roleDistribution = useMemo(() => {
    const roles = ['teacher', 'para', 'admin', 'therapist', 'viewer'];
    return roles.map(role => ({
      name: role.charAt(0).toUpperCase() + role.slice(1),
      value: users.filter(u => u.role === role).length
    })).filter(r => r.value > 0);
  }, [users]);

  // Top performers (most data collected this week)
  const topPerformers = useMemo(() => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const weekLogs = logs.filter(l => l.dateISO >= weekAgo);

    const userStats = users.map(user => {
      const userLogs = weekLogs.filter(l => l.paraId === user.id || l.teacherId === user.id);
      return {
        ...user,
        sessionCount: userLogs.length,
        avgAccuracy: userLogs.length > 0
          ? Math.round(userLogs.reduce((sum, l) => sum + (l.stats?.accuracy || 0), 0) / userLogs.length)
          : 0
      };
    });

    return userStats
      .filter(u => u.sessionCount > 0)
      .sort((a, b) => b.sessionCount - a.sessionCount)
      .slice(0, 5);
  }, [users, logs]);

  // Goal area breakdown
  const goalAreaStats = useMemo(() => {
    const areas = ['Reading', 'Math', 'Writing', 'Behavior', 'Communication', 'Social Skills', 'Motor Skills', 'Other'];
    return areas.map(area => ({
      area,
      count: goals.filter(g => g.area === area).length,
      avgProgress: goals
        .filter(g => g.area === area)
        .reduce((sum, g) => {
          const goalLogs = logs.filter(l => l.goalId === g.id);
          const avgScore = goalLogs.length > 0
            ? goalLogs.reduce((s, l) => s + (l.stats?.accuracy || 0), 0) / goalLogs.length
            : 0;
          return sum + avgScore;
        }, 0) / (goals.filter(g => g.area === area).length || 1)
    })).filter(a => a.count > 0);
  }, [goals, logs]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">System-wide analytics and oversight</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Database className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline">
            <Shield className="w-4 h-4 mr-2" />
            Audit Log
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {(metrics.criticalAlerts > 0 || metrics.warningAlerts > 0) && (
        <Card className="border-2 border-red-300 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="font-bold text-red-900">Data Integrity Alerts</h3>
                <p className="text-sm text-red-700">
                  {metrics.criticalAlerts} critical, {metrics.warningAlerts} warnings requiring attention
                </p>
              </div>
              <Button size="sm" className="ml-auto">
                Review Alerts
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key System Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-blue-600">{metrics.activeUsers}</div>
                <div className="text-xs text-gray-600 mt-1">Active Users</div>
              </div>
              <Users className="w-10 h-10 text-blue-400" />
            </div>
            <div className="mt-3 text-xs text-gray-600">
              {metrics.teacherCount} Teachers, {metrics.paraCount} Paras
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-purple-600">{metrics.activeStudents}</div>
                <div className="text-xs text-gray-600 mt-1">Active Students</div>
              </div>
              <Target className="w-10 h-10 text-purple-400" />
            </div>
            <div className="mt-3 text-xs text-gray-600">
              {metrics.totalGoals} Total Goals
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-600">{metrics.complianceRate}%</div>
                <div className="text-xs text-gray-600 mt-1">Compliance Rate</div>
              </div>
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <div className="mt-3 text-xs text-gray-600">
              Data collected this week
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-orange-600">{metrics.weekLogs}</div>
                <div className="text-xs text-gray-600 mt-1">Weekly Sessions</div>
              </div>
              <Activity className="w-10 h-10 text-orange-400" />
            </div>
            <div className="mt-3 text-xs text-gray-600">
              {metrics.todayLogs} today
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Trends */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            30-Day Usage Trends
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={usageTrends}>
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
                dataKey="users"
                stroke="#10b981"
                strokeWidth={2}
                name="Active Users"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Goal Area Breakdown */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Goal Areas
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={goalAreaStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="area" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" name="Goal Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Role Distribution */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              User Roles
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={roleDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Top Performers This Week
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {topPerformers.map((user, index) => (
              <Card key={user.id} className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                <CardContent className="pt-4 pb-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600 mb-1">
                    #{index + 1}
                  </div>
                  <div className="font-semibold text-gray-900 text-sm mb-2">
                    {user.firstName} {user.lastName}
                  </div>
                  <Badge variant="outline" className="text-xs mb-1">
                    {user.role}
                  </Badge>
                  <div className="text-xs text-gray-600 mt-2">
                    <div className="font-bold text-blue-600">{user.sessionCount} sessions</div>
                    <div>{user.avgAccuracy}% accuracy</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Health Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={metrics.collectionRate >= 80 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {metrics.collectionRate >= 80 ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              )}
              <div>
                <div className="text-2xl font-bold">{metrics.collectionRate}%</div>
                <div className="text-xs text-gray-600">Data Collection Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={metrics.engagementRate >= 75 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {metrics.engagementRate >= 75 ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              )}
              <div>
                <div className="text-2xl font-bold">{metrics.engagementRate}%</div>
                <div className="text-xs text-gray-600">User Engagement</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={metrics.complianceRate >= 90 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {metrics.complianceRate >= 90 ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600" />
              )}
              <div>
                <div className="text-2xl font-bold">{metrics.complianceRate}%</div>
                <div className="text-xs text-gray-600">FERPA Compliance</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
