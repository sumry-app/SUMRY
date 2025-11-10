import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Award, Flame, Star, Trophy, Target, Zap, Crown, Medal,
  CheckCircle, TrendingUp, Calendar, Users, Sparkles
} from 'lucide-react';

/**
 * AchievementSystem - Feature #16: Gamified Accountability
 *
 * Streaks, badges, and achievements to drive para engagement
 * Motivates consistent data collection through gamification
 */

// Achievement definitions
const ACHIEVEMENTS = [
  {
    id: 'first_session',
    title: 'Getting Started',
    description: 'Complete your first data collection session',
    icon: Star,
    color: 'bg-blue-100 text-blue-600 border-blue-300',
    points: 10,
    criteria: (stats) => stats.totalSessions >= 1
  },
  {
    id: 'week_warrior',
    title: 'Week Warrior',
    description: 'Complete 5 sessions in one week',
    icon: Calendar,
    color: 'bg-green-100 text-green-600 border-green-300',
    points: 25,
    criteria: (stats) => stats.maxWeekSessions >= 5
  },
  {
    id: 'streak_starter',
    title: 'Streak Starter',
    description: 'Maintain a 3-day streak',
    icon: Flame,
    color: 'bg-orange-100 text-orange-600 border-orange-300',
    points: 30,
    criteria: (stats) => stats.currentStreak >= 3
  },
  {
    id: 'on_fire',
    title: 'On Fire!',
    description: 'Maintain a 7-day streak',
    icon: Flame,
    color: 'bg-red-100 text-red-600 border-red-300',
    points: 75,
    criteria: (stats) => stats.currentStreak >= 7
  },
  {
    id: 'unstoppable',
    title: 'Unstoppable',
    description: 'Maintain a 30-day streak',
    icon: Crown,
    color: 'bg-purple-100 text-purple-600 border-purple-300',
    points: 250,
    criteria: (stats) => stats.currentStreak >= 30
  },
  {
    id: 'century_club',
    title: 'Century Club',
    description: 'Complete 100 total sessions',
    icon: Trophy,
    color: 'bg-yellow-100 text-yellow-600 border-yellow-300',
    points: 100,
    criteria: (stats) => stats.totalSessions >= 100
  },
  {
    id: 'quality_guru',
    title: 'Quality Guru',
    description: 'Maintain 90%+ average accuracy over 20 sessions',
    icon: Target,
    color: 'bg-cyan-100 text-cyan-600 border-cyan-300',
    points: 50,
    criteria: (stats) => stats.totalSessions >= 20 && stats.avgAccuracy >= 90
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Complete 10 sessions in one day',
    icon: Zap,
    color: 'bg-indigo-100 text-indigo-600 border-indigo-300',
    points: 40,
    criteria: (stats) => stats.maxDailySessions >= 10
  },
  {
    id: 'team_player',
    title: 'Team Player',
    description: 'Work with 5 different students',
    icon: Users,
    color: 'bg-pink-100 text-pink-600 border-pink-300',
    points: 35,
    criteria: (stats) => stats.uniqueStudents >= 5
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Achieve 100% accuracy in 10 sessions',
    icon: Medal,
    color: 'bg-emerald-100 text-emerald-600 border-emerald-300',
    points: 60,
    criteria: (stats) => stats.perfectSessions >= 10
  },
  {
    id: 'marathon_runner',
    title: 'Marathon Runner',
    description: 'Complete 500 total sessions',
    icon: Trophy,
    color: 'bg-amber-100 text-amber-600 border-amber-300',
    points: 500,
    criteria: (stats) => stats.totalSessions >= 500
  },
  {
    id: 'legend',
    title: 'SUMRY Legend',
    description: 'Reach 1,000 points',
    icon: Sparkles,
    color: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600 border-purple-300',
    points: 0, // Special achievement
    criteria: (stats) => stats.totalPoints >= 1000
  }
];

// Streak milestones for visual celebration
const STREAK_MILESTONES = [
  { days: 3, title: '🔥 Hot Streak!', color: 'text-orange-600' },
  { days: 7, title: '🔥 Week Warrior!', color: 'text-red-600' },
  { days: 14, title: '🔥 Two Week Titan!', color: 'text-purple-600' },
  { days: 30, title: '👑 Monthly Master!', color: 'text-yellow-600' },
  { days: 60, title: '⚡ Unstoppable Force!', color: 'text-blue-600' },
  { days: 100, title: '🏆 Legendary Streak!', color: 'text-pink-600' }
];

export default function AchievementSystem({ userId, logs, students }) {
  const [showAll, setShowAll] = useState(false);

  // Calculate user statistics
  const stats = useMemo(() => {
    const userLogs = logs.filter(l => l.paraId === userId);

    // Current streak
    let currentStreak = 0;
    let longestStreak = 0;
    let checkDate = new Date();

    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const hasLog = userLogs.some(log => log.dateISO === dateStr);

      if (!hasLog && currentStreak > 0) break;
      if (hasLog) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      }

      checkDate.setDate(checkDate.getDate() - 1);
      if (currentStreak > 100) break; // Safety cap
    }

    // Calculate other stats
    const totalSessions = userLogs.length;

    const avgAccuracy = totalSessions > 0
      ? Math.round(userLogs.reduce((sum, l) => sum + (l.stats?.accuracy || 0), 0) / totalSessions)
      : 0;

    const perfectSessions = userLogs.filter(l => l.stats?.accuracy === 100).length;

    const uniqueStudents = new Set(userLogs.map(l => l.studentId)).size;

    // Max sessions in one week
    const weekCounts = {};
    userLogs.forEach(log => {
      const date = new Date(log.dateISO);
      const weekKey = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
      weekCounts[weekKey] = (weekCounts[weekKey] || 0) + 1;
    });
    const maxWeekSessions = Math.max(...Object.values(weekCounts), 0);

    // Max sessions in one day
    const dayCounts = {};
    userLogs.forEach(log => {
      dayCounts[log.dateISO] = (dayCounts[log.dateISO] || 0) + 1;
    });
    const maxDailySessions = Math.max(...Object.values(dayCounts), 0);

    return {
      currentStreak,
      longestStreak,
      totalSessions,
      avgAccuracy,
      perfectSessions,
      uniqueStudents,
      maxWeekSessions,
      maxDailySessions,
      totalPoints: 0 // Will be calculated below
    };
  }, [logs, userId]);

  // Calculate earned achievements
  const earnedAchievements = useMemo(() => {
    const earned = ACHIEVEMENTS.filter(achievement => {
      if (achievement.id === 'legend') return false; // Calculate separately
      return achievement.criteria(stats);
    });

    // Calculate total points
    const totalPoints = earned.reduce((sum, a) => sum + a.points, 0);
    stats.totalPoints = totalPoints;

    // Check if legend achievement is earned
    if (totalPoints >= 1000) {
      const legendAchievement = ACHIEVEMENTS.find(a => a.id === 'legend');
      if (legendAchievement) earned.push(legendAchievement);
    }

    return earned;
  }, [stats]);

  // Get next achievements to work towards
  const nextAchievements = ACHIEVEMENTS
    .filter(a => !earnedAchievements.some(e => e.id === a.id))
    .slice(0, 3);

  // Get current streak milestone
  const currentMilestone = [...STREAK_MILESTONES]
    .reverse()
    .find(m => stats.currentStreak >= m.days);

  // Calculate progress to next achievement
  const getProgress = (achievement) => {
    if (achievement.id === 'first_session') {
      return Math.min((stats.totalSessions / 1) * 100, 100);
    } else if (achievement.id === 'week_warrior') {
      return Math.min((stats.maxWeekSessions / 5) * 100, 100);
    } else if (achievement.id === 'streak_starter') {
      return Math.min((stats.currentStreak / 3) * 100, 100);
    } else if (achievement.id === 'on_fire') {
      return Math.min((stats.currentStreak / 7) * 100, 100);
    } else if (achievement.id === 'unstoppable') {
      return Math.min((stats.currentStreak / 30) * 100, 100);
    } else if (achievement.id === 'century_club') {
      return Math.min((stats.totalSessions / 100) * 100, 100);
    } else if (achievement.id === 'marathon_runner') {
      return Math.min((stats.totalSessions / 500) * 100, 100);
    }
    return 0;
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <Card className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Flame className={`w-8 h-8 ${stats.currentStreak > 0 ? 'text-orange-300' : 'text-gray-400'}`} />
                <div className="text-4xl font-bold">{stats.currentStreak}</div>
              </div>
              <div className="text-sm text-purple-100">Day Streak</div>
              {currentMilestone && (
                <div className={`text-xs font-bold mt-1 ${currentMilestone.color}`}>
                  {currentMilestone.title}
                </div>
              )}
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="w-8 h-8 text-yellow-300" />
                <div className="text-4xl font-bold">{earnedAchievements.length}</div>
              </div>
              <div className="text-sm text-purple-100">Achievements</div>
              <div className="text-xs mt-1">
                of {ACHIEVEMENTS.length} total
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-8 h-8 text-yellow-300" />
                <div className="text-4xl font-bold">{stats.totalPoints}</div>
              </div>
              <div className="text-sm text-purple-100">Total Points</div>
              {stats.totalPoints >= 1000 && (
                <div className="text-xs font-bold mt-1 text-yellow-300">
                  ⭐ Legend Status!
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievement Unlock (if any new ones) */}
      {earnedAchievements.length > 0 && (
        <Card className="border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {React.createElement(earnedAchievements[earnedAchievements.length - 1].icon, {
                  className: 'w-12 h-12 text-yellow-600'
                })}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-bold text-gray-900">
                    Latest Achievement
                  </span>
                  <Sparkles className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="font-semibold text-gray-800">
                  {earnedAchievements[earnedAchievements.length - 1].title}
                </div>
                <div className="text-sm text-gray-600">
                  {earnedAchievements[earnedAchievements.length - 1].description}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-600">
                  +{earnedAchievements[earnedAchievements.length - 1].points}
                </div>
                <div className="text-xs text-gray-600">points</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Achievements to Unlock */}
      {nextAchievements.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Next Achievements
            </h3>
            <div className="space-y-3">
              {nextAchievements.map(achievement => {
                const Icon = achievement.icon;
                const progress = getProgress(achievement);

                return (
                  <Card key={achievement.id} className="border-2">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${achievement.color} border-2`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 mb-1">
                            {achievement.title}
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            {achievement.description}
                          </div>
                          {progress > 0 && (
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-blue-600">
                            {achievement.points}
                          </div>
                          <div className="text-xs text-gray-600">points</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Achievements */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              All Achievements ({earnedAchievements.length}/{ACHIEVEMENTS.length})
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less' : 'Show All'}
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(showAll ? ACHIEVEMENTS : ACHIEVEMENTS.slice(0, 8)).map(achievement => {
              const Icon = achievement.icon;
              const earned = earnedAchievements.some(e => e.id === achievement.id);

              return (
                <Card
                  key={achievement.id}
                  className={`${
                    earned
                      ? `${achievement.color} border-2`
                      : 'bg-gray-50 border-gray-200 opacity-50'
                  } transition-all`}
                >
                  <CardContent className="pt-4 pb-4 text-center">
                    <Icon className={`w-10 h-10 mx-auto mb-2 ${earned ? '' : 'text-gray-400'}`} />
                    <div className="font-semibold text-sm mb-1">
                      {achievement.title}
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      {achievement.description}
                    </div>
                    <Badge variant={earned ? 'default' : 'outline'} className="text-xs">
                      {achievement.points} pts
                    </Badge>
                    {earned && (
                      <div className="mt-2">
                        <CheckCircle className="w-5 h-5 mx-auto text-green-600" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Personal Stats */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gray-600" />
            Your Stats
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.totalSessions}</div>
              <div className="text-sm text-gray-600">Total Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.avgAccuracy}%</div>
              <div className="text-sm text-gray-600">Avg Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.longestStreak}</div>
              <div className="text-sm text-gray-600">Longest Streak</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{stats.uniqueStudents}</div>
              <div className="text-sm text-gray-600">Students</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component to show achievement notification
export function AchievementNotification({ achievement, onDismiss }) {
  const Icon = achievement.icon;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-bounce">
      <Card className={`${achievement.color} border-4 shadow-2xl`}>
        <CardContent className="pt-6 pb-6">
          <div className="flex items-center gap-4">
            <Icon className="w-12 h-12" />
            <div>
              <div className="font-bold text-lg mb-1">
                🎉 Achievement Unlocked!
              </div>
              <div className="font-semibold">{achievement.title}</div>
              <div className="text-sm opacity-90">{achievement.description}</div>
              <div className="mt-2 text-lg font-bold">
                +{achievement.points} points
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="ml-4"
            >
              ✕
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
