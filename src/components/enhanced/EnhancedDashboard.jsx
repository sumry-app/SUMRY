import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Target,
  TrendingUp,
  Award,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Zap,
  Star,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { designTokens } from '@/design/tokens';
import {
  staggerContainer,
  staggerItem,
  hoverLift,
  cardInteraction,
  fadeInUp
} from '@/design/microInteractions';
import { Skeleton, DashboardSkeleton } from '@/components/smart/LoadingStates';
import EmptyState from '@/components/smart/EmptyState';

/**
 * EnhancedDashboard - Modern, beautiful dashboard
 *
 * Features:
 * - Beautiful animations
 * - Smart insights
 * - Context-aware widgets
 * - Micro-interactions
 * - Responsive design
 */
export default function EnhancedDashboard({
  students = [],
  goals = [],
  logs = [],
  user,
  onNavigate,
  isLoading = false
}) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');

  // Calculate insights
  const insights = useMemo(() => {
    const today = new Date();
    const weekAgo = new Date(today - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today - 30 * 24 * 60 * 60 * 1000);

    const recentLogs = logs.filter(log =>
      new Date(log.dateISO) >= (selectedTimeframe === 'week' ? weekAgo : monthAgo)
    );

    const activeGoals = goals.filter(g => g.status !== 'completed');
    const completedGoals = goals.filter(g => g.status === 'completed');

    const studentsWithRecentData = new Set(recentLogs.map(l => l.studentId)).size;

    const avgAccuracy = recentLogs.length > 0
      ? recentLogs.reduce((sum, log) => sum + (log.stats?.accuracy || 0), 0) / recentLogs.length
      : 0;

    return {
      totalStudents: students.length,
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      recentLogs: recentLogs.length,
      studentsWithRecentData,
      avgAccuracy: Math.round(avgAccuracy),
      needsAttention: students.length - studentsWithRecentData
    };
  }, [students, goals, logs, selectedTimeframe]);

  // Get smart suggestions
  const suggestions = useMemo(() => {
    const suggestions = [];
    const hour = new Date().getHours();

    // Morning greeting
    if (hour >= 6 && hour < 12) {
      suggestions.push({
        id: 'morning',
        type: 'greeting',
        message: `Good morning, ${user?.name || 'there'}! Ready to make progress today?`,
        icon: Zap,
        color: 'purple'
      });
    }

    // Students needing attention
    if (insights.needsAttention > 0) {
      suggestions.push({
        id: 'attention',
        type: 'alert',
        message: `${insights.needsAttention} student${insights.needsAttention !== 1 ? 's' : ''} need${insights.needsAttention === 1 ? 's' : ''} data logged this week`,
        icon: AlertCircle,
        color: 'orange',
        action: () => onNavigate?.('students')
      });
    }

    // Great progress
    if (insights.avgAccuracy >= 80 && insights.recentLogs > 10) {
      suggestions.push({
        id: 'progress',
        type: 'success',
        message: `Awesome! ${insights.avgAccuracy}% average accuracy this week 🎉`,
        icon: TrendingUp,
        color: 'green'
      });
    }

    return suggestions;
  }, [insights, user, onNavigate]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (students.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Welcome to SUMRY!"
        description="Let's get started by adding your first student to begin tracking their progress."
        action={() => onNavigate?.('students')}
        actionLabel="Add First Student"
      />
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-6 p-6"
    >
      {/* Header */}
      <motion.div variants={staggerItem}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user?.role === 'para' ? 'My Work' : 'Dashboard'}
            </h1>
            <p className="text-gray-600">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* Timeframe selector */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            {['week', 'month'].map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`
                  px-4 py-2 rounded-md text-sm font-medium transition-all
                  ${selectedTimeframe === timeframe
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                {timeframe === 'week' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Smart Suggestions */}
      <AnimatePresence>
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={suggestion.id}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
            custom={index}
          >
            <Card
              className={`
                border-2
                ${suggestion.color === 'purple' ? 'bg-purple-50 border-purple-200' : ''}
                ${suggestion.color === 'orange' ? 'bg-orange-50 border-orange-200' : ''}
                ${suggestion.color === 'green' ? 'bg-green-50 border-green-200' : ''}
              `}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`
                    p-2 rounded-lg
                    ${suggestion.color === 'purple' ? 'bg-purple-600' : ''}
                    ${suggestion.color === 'orange' ? 'bg-orange-600' : ''}
                    ${suggestion.color === 'green' ? 'bg-green-600' : ''}
                  `}>
                    <suggestion.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="flex-1 text-gray-900 font-medium">{suggestion.message}</p>
                  {suggestion.action && (
                    <Button
                      onClick={suggestion.action}
                      variant="outline"
                      size="sm"
                      className="gap-1"
                    >
                      View
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Stats Grid */}
      <motion.div variants={staggerItem} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Students"
          value={insights.totalStudents}
          trend={insights.studentsWithRecentData}
          trendLabel="with recent data"
          color="blue"
          onClick={() => onNavigate?.('students')}
        />

        <StatCard
          icon={Target}
          label="Active Goals"
          value={insights.activeGoals}
          trend={insights.completedGoals}
          trendLabel="completed"
          color="green"
          onClick={() => onNavigate?.('goals')}
        />

        <StatCard
          icon={TrendingUp}
          label="Data Points"
          value={insights.recentLogs}
          trend={insights.avgAccuracy > 0 ? `${insights.avgAccuracy}%` : null}
          trendLabel="avg accuracy"
          color="purple"
          onClick={() => onNavigate?.('progress')}
        />

        <StatCard
          icon={Award}
          label="This Week"
          value={insights.recentLogs}
          trend="Keep it up!"
          trendLabel="entries logged"
          color="orange"
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <QuickAction
                icon={TrendingUp}
                title="Log Progress"
                description="Quick data entry"
                onClick={() => onNavigate?.('progress')}
              />
              <QuickAction
                icon={Users}
                title="Add Student"
                description="Expand your caseload"
                onClick={() => onNavigate?.('students')}
              />
              <QuickAction
                icon={Target}
                title="Create Goal"
                description="Set new objectives"
                onClick={() => onNavigate?.('goals')}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <Button variant="ghost" size="sm" className="gap-1">
                View All
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {logs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-2">
                {logs.slice(0, 5).map((log, index) => {
                  const student = students.find(s => s.id === log.studentId);
                  const goal = goals.find(g => g.id === log.goalId);

                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {student?.name || 'Unknown Student'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {goal?.description?.slice(0, 50) || 'No goal'}...
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <Badge variant="outline" className="mb-1">
                          {log.stats?.accuracy || 0}%
                        </Badge>
                        <p className="text-xs text-gray-500">
                          {new Date(log.dateISO).toLocaleDateString()}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, trend, trendLabel, color, onClick }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <motion.div
      variants={cardInteraction}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="border-2 border-gray-200 overflow-hidden">
        <CardContent className="pt-6 relative">
          {/* Background gradient */}
          <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colors[color]} opacity-10 rounded-full -mr-8 -mt-8`} />

          {/* Icon */}
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center mb-4`}>
            <Icon className="w-6 h-6 text-white" />
          </div>

          {/* Label */}
          <p className="text-sm text-gray-600 mb-1">{label}</p>

          {/* Value */}
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>

          {/* Trend */}
          {trend && (
            <div className="flex items-center gap-1 text-xs">
              <span className="font-medium text-gray-900">{trend}</span>
              <span className="text-gray-500">{trendLabel}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Quick Action Component
function QuickAction({ icon: Icon, title, description, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left group"
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="p-2 rounded-lg bg-blue-100 group-hover:bg-blue-600 transition-colors">
        <Icon className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
    </motion.button>
  );
}
