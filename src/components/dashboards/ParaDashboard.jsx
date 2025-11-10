import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Target, CheckCircle, Clock, TrendingUp, Award, Flame,
  Calendar, Bell, MessageSquare, User, ChevronRight, Play
} from 'lucide-react';

/**
 * ParaDashboard - Feature #13: Para Mobile Dashboard
 *
 * Mobile-optimized dashboard for paraprofessionals
 * Features: Daily checklist, assigned goals, streaks, quick data entry
 * Designed for on-the-go use with large touch targets
 */
export default function ParaDashboard({
  assignments,
  students,
  goals,
  logs,
  reminders,
  paraUser,
  onStartDataEntry,
  onViewAssignment
}) {
  const [activeView, setActiveView] = useState('today');

  // Calculate para-specific metrics
  const metrics = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const todayLogs = logs.filter(log =>
      log.paraId === paraUser.id && log.dateISO === today
    );

    const weekLogs = logs.filter(log =>
      log.paraId === paraUser.id && log.dateISO >= thisWeek
    );

    // Calculate streak (consecutive days with data)
    let streak = 0;
    let checkDate = new Date();
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const hasLog = logs.some(log =>
        log.paraId === paraUser.id && log.dateISO === dateStr
      );
      if (!hasLog && streak > 0) break;
      if (hasLog) streak++;
      checkDate.setDate(checkDate.getDate() - 1);
      if (streak > 30) break; // Cap at 30 days
    }

    // Calculate pending assignments for today
    const pendingToday = assignments.filter(a =>
      a.paraId === paraUser.id &&
      a.schedule.includes(new Date().getDay()) &&
      !todayLogs.some(log => log.goalId === a.goalId)
    );

    return {
      todaySessionsComplete: todayLogs.length,
      todaySessionsPending: pendingToday.length,
      weekSessions: weekLogs.length,
      streak,
      totalAssignments: assignments.filter(a => a.paraId === paraUser.id).length
    };
  }, [assignments, logs, paraUser]);

  // Get today's assignments
  const todayAssignments = useMemo(() => {
    const today = new Date().getDay(); // 0-6
    const todayStr = new Date().toISOString().split('T')[0];

    return assignments
      .filter(a =>
        a.paraId === paraUser.id &&
        a.schedule.includes(today)
      )
      .map(assignment => {
        const goal = goals.find(g => g.id === assignment.goalId);
        const student = students.find(s => s.id === goal?.studentId);
        const completedToday = logs.some(log =>
          log.goalId === assignment.goalId &&
          log.dateISO === todayStr
        );

        return {
          ...assignment,
          goal,
          student,
          completedToday,
          timeSlot: assignment.timeSlot || 'Anytime'
        };
      })
      .sort((a, b) => {
        // Sort by completion status, then time slot
        if (a.completedToday !== b.completedToday) {
          return a.completedToday ? 1 : -1;
        }
        return (a.timeSlot || '').localeCompare(b.timeSlot || '');
      });
  }, [assignments, goals, students, logs, paraUser]);

  // Get upcoming reminders
  const upcomingReminders = useMemo(() => {
    return reminders
      .filter(r => r.userId === paraUser.id && !r.completed)
      .sort((a, b) => a.time.localeCompare(b.time))
      .slice(0, 3);
  }, [reminders, paraUser]);

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-20">
      {/* Welcome Header */}
      <Card className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">
                Welcome back, {paraUser.firstName}! 👋
              </h1>
              <p className="text-purple-100">
                {metrics.todaySessionsComplete > 0
                  ? `Great work! ${metrics.todaySessionsComplete} sessions completed today`
                  : `Let's make today count!`
                }
              </p>
            </div>
            {metrics.streak > 0 && (
              <div className="text-center">
                <div className="flex items-center gap-2 justify-center">
                  <Flame className="w-8 h-8 text-orange-300" />
                  <span className="text-4xl font-bold">{metrics.streak}</span>
                </div>
                <div className="text-xs text-purple-200 mt-1">Day Streak</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-3xl font-bold text-green-600">
              {metrics.todaySessionsComplete}
            </div>
            <div className="text-xs text-gray-600 mt-1">Done Today</div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-3xl font-bold text-orange-600">
              {metrics.todaySessionsPending}
            </div>
            <div className="text-xs text-gray-600 mt-1">Pending</div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-3xl font-bold text-blue-600">
              {metrics.weekSessions}
            </div>
            <div className="text-xs text-gray-600 mt-1">This Week</div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Reminders */}
      {upcomingReminders.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-gray-900">Upcoming Reminders</h3>
            </div>
            <div className="space-y-2">
              {upcomingReminders.map(reminder => (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between p-2 bg-white rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">{reminder.time}</span>
                    <span className="text-sm text-gray-600">{reminder.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Assignments */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Today's Schedule ({todayAssignments.length})
            </h2>
          </div>

          {todayAssignments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No assignments scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAssignments.map(assignment => (
                <Card
                  key={assignment.id}
                  className={`border-2 transition-all ${
                    assignment.completedToday
                      ? 'bg-green-50 border-green-300 opacity-75'
                      : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {assignment.completedToday ? (
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <Target className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          )}
                          <div>
                            <div className="font-semibold text-gray-900">
                              {assignment.student?.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {assignment.goal?.description}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {assignment.timeSlot}
                          </Badge>
                          {assignment.goal?.area && (
                            <Badge variant="outline" className="text-xs">
                              {assignment.goal.area}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {!assignment.completedToday && (
                          <Button
                            onClick={() => onStartDataEntry(assignment)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Start
                          </Button>
                        )}
                        <Button
                          onClick={() => onViewAssignment(assignment)}
                          size="sm"
                          variant="outline"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievement Section */}
      {metrics.weekSessions >= 20 && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Award className="w-12 h-12 text-yellow-600" />
              <div>
                <h3 className="font-bold text-gray-900">🎉 Achievement Unlocked!</h3>
                <p className="text-sm text-gray-600">
                  20+ sessions this week - You're crushing it!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
