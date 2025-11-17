import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  MessageSquare,
  Calendar,
  Target,
  Download,
  Filter,
  Eye,
  EyeOff,
  Plus,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
  Dot
} from 'recharts';
/**
 * ProgressTimeline Component
 * Vertical timeline showing all progress logs with trend analysis
 */
export default function ProgressTimeline({ goals = [], progressLogs = [], students = [], onAddAnnotation }) {
  const [selectedGoals, setSelectedGoals] = useState(new Set());
  const [showTrendLine, setShowTrendLine] = useState(true);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [expandedLogs, setExpandedLogs] = useState(new Set());
  const [annotations, setAnnotations] = useState({});
  const [editingAnnotation, setEditingAnnotation] = useState(null);
  const timelineRef = useRef(null);

  // Organize logs by goal
  const logsByGoal = useMemo(() => {
    const organized = {};
    progressLogs.forEach(log => {
      if (!organized[log.goal_id]) {
        organized[log.goal_id] = [];
      }
      organized[log.goal_id].push(log);
    });

    // Sort logs by date within each goal
    Object.keys(organized).forEach(goalId => {
      organized[goalId].sort((a, b) => {
        const dateA = parseISO(a.date);
        const dateB = parseISO(b.date);
        return dateA - dateB;
      });
    });

    return organized;
  }, [progressLogs]);

  // Get goals to display
  const displayGoals = useMemo(() => {
    return goals.filter(goal => {
      const hasLogs = logsByGoal[goal.id]?.length > 0;
      const isSelected = selectedGoals.size === 0 || selectedGoals.has(goal.id);
      return hasLogs && isSelected;
    });
  }, [goals, logsByGoal, selectedGoals]);

  // Calculate trend data for chart
  const trendData = useMemo(() => {
    const allData = [];

    displayGoals.forEach(goal => {
      const logs = logsByGoal[goal.id] || [];
      logs.forEach(log => {
        allData.push({
          date: log.date,
          score: log.score,
          goalId: goal.id,
          goalName: goal.description,
          notes: log.notes
        });
      });
    });

    return allData.sort((a, b) => {
      const dateA = parseISO(a.date);
      const dateB = parseISO(b.date);
      return dateA - dateB;
    });
  }, [displayGoals, logsByGoal]);

  // Calculate trend line
  const trendLineData = useMemo(() => {
    if (trendData.length < 2) return [];

    // Simple linear regression
    const n = trendData.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    trendData.forEach((point, index) => {
      sumX += index;
      sumY += point.score;
      sumXY += index * point.score;
      sumXX += index * index;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return trendData.map((point, index) => ({
      ...point,
      trend: slope * index + intercept
    }));
  }, [trendData]);

  // Toggle goal selection
  const toggleGoal = (goalId) => {
    setSelectedGoals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(goalId)) {
        newSet.delete(goalId);
      } else {
        newSet.add(goalId);
      }
      return newSet;
    });
  };

  // Toggle log expansion
  const toggleLogExpansion = (logId) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  // Save annotation
  const saveAnnotation = (logId, text) => {
    setAnnotations(prev => ({ ...prev, [logId]: text }));
    setEditingAnnotation(null);
    onAddAnnotation?.(logId, text);
  };

  // Export as image
  const handleExportImage = async () => {
    if (timelineRef.current) {
      try {
        // Dynamic import for html2canvas
        const html2canvas = await import('html2canvas').then(mod => mod.default).catch(() => null);

        if (!html2canvas) {
          console.warn('html2canvas not available. Install it with: npm install html2canvas');
          // Fallback: just print the timeline
          window.print();
          return;
        }

        const canvas = await html2canvas(timelineRef.current, {
          backgroundColor: '#ffffff',
          scale: 2
        });
        const link = document.createElement('a');
        link.download = `progress-timeline-${format(new Date(), 'yyyy-MM-dd')}.png`;
        link.href = canvas.toDataURL();
        link.click();
      } catch (error) {
        console.error('Failed to export image:', error);
        // Fallback to print
        window.print();
      }
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    if (trendData.length === 0) return null;

    const scores = trendData.map(d => d.score);
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    const min = Math.min(...scores);
    const max = Math.max(...scores);

    // Calculate trend direction
    const firstScore = scores[0];
    const lastScore = scores[scores.length - 1];
    const change = lastScore - firstScore;
    const percentChange = (change / firstScore) * 100;

    return {
      average: average.toFixed(1),
      min,
      max,
      totalLogs: trendData.length,
      change: change.toFixed(1),
      percentChange: percentChange.toFixed(1),
      trend: change > 0 ? 'improving' : change < 0 ? 'declining' : 'stable'
    };
  }, [trendData]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Progress Timeline</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Vertical timeline with trend analysis
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant={showTrendLine ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowTrendLine(!showTrendLine)}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Trend Line
              </Button>

              <Button
                variant={showAnnotations ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowAnnotations(!showAnnotations)}
              >
                {showAnnotations ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
                Annotations
              </Button>

              <Button variant="outline" size="sm" onClick={handleExportImage}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <StatCard
            label="Total Logs"
            value={stats.totalLogs}
            icon={Calendar}
            color="blue"
          />
          <StatCard
            label="Average Score"
            value={stats.average}
            icon={Target}
            color="purple"
          />
          <StatCard
            label="Score Range"
            value={`${stats.min} - ${stats.max}`}
            icon={Minus}
            color="teal"
          />
          <StatCard
            label="Overall Trend"
            value={stats.percentChange + '%'}
            icon={stats.trend === 'improving' ? TrendingUp : stats.trend === 'declining' ? TrendingDown : Minus}
            color={stats.trend === 'improving' ? 'green' : stats.trend === 'declining' ? 'red' : 'gray'}
            subtitle={stats.trend}
          />
        </motion.div>
      )}

      {/* Goal Filter */}
      {goals.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Filter by Goal:</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedGoals(new Set())}
                >
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {goals.map(goal => {
                  const hasLogs = logsByGoal[goal.id]?.length > 0;
                  if (!hasLogs) return null;

                  const isSelected = selectedGoals.size === 0 || selectedGoals.has(goal.id);
                  return (
                    <button
                      key={goal.id}
                      onClick={() => toggleGoal(goal.id)}
                      className={`
                        px-3 py-1 rounded-full text-xs font-medium border-2 transition-all
                        ${isSelected
                          ? 'bg-[#65A39B] text-white border-[#65A39B]'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                        }
                      `}
                    >
                      {goal.description}
                      <Badge variant="secondary" className="ml-2">
                        {logsByGoal[goal.id]?.length || 0}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trend Chart */}
      {trendData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Progress Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={showTrendLine ? trendLineData : trendData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#65A39B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#65A39B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="date"
                  stroke="#6B7280"
                  fontSize={12}
                  tickFormatter={(date) => format(parseISO(date), 'MMM d')}
                />
                <YAxis stroke="#6B7280" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  content={<CustomTooltip />}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <ReferenceLine y={50} stroke="#FCD34D" strokeDasharray="3 3" label="50%" />
                <ReferenceLine y={80} stroke="#34D399" strokeDasharray="3 3" label="80%" />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#65A39B"
                  strokeWidth={2}
                  fill="url(#colorScore)"
                  dot={<CustomDot />}
                  activeDot={{ r: 8 }}
                />
                {showTrendLine && (
                  <Line
                    type="monotone"
                    dataKey="trend"
                    stroke="#E3866B"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card ref={timelineRef}>
        <CardHeader>
          <CardTitle className="text-lg">Detailed Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {displayGoals.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No progress logs to display</p>
              <p className="text-sm text-gray-400 mt-1">
                Add progress logs to visualize the timeline
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {displayGoals.map(goal => {
                const logs = logsByGoal[goal.id] || [];
                const student = students.find(s => s.id === goal.student_id);

                return (
                  <div key={goal.id} className="space-y-4">
                    {/* Goal Header */}
                    <div className="flex items-start gap-3 pb-2 border-b-2 border-[#65A39B]">
                      <div className="p-2 bg-[#65A39B]/10 rounded-lg">
                        <Target className="w-5 h-5 text-[#65A39B]" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{goal.description}</h4>
                        {student && (
                          <p className="text-sm text-gray-500 mt-1">{student.name}</p>
                        )}
                      </div>
                      <Badge variant="outline">{logs.length} logs</Badge>
                    </div>

                    {/* Progress Logs */}
                    <div className="relative pl-8">
                      {/* Timeline Line */}
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#65A39B] to-[#E3866B]" />

                      <div className="space-y-6">
                        <AnimatePresence>
                          {logs.map((log, index) => (
                            <ProgressLogItem
                              key={log.id}
                              log={log}
                              index={index}
                              isExpanded={expandedLogs.has(log.id)}
                              onToggle={() => toggleLogExpansion(log.id)}
                              annotation={annotations[log.id]}
                              isEditingAnnotation={editingAnnotation === log.id}
                              onEditAnnotation={() => setEditingAnnotation(log.id)}
                              onSaveAnnotation={(text) => saveAnnotation(log.id, text)}
                              onCancelAnnotation={() => setEditingAnnotation(null)}
                              showAnnotations={showAnnotations}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Stat Card Component
 */
function StatCard({ label, value, icon: Icon, color, subtitle }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    teal: 'from-teal-500 to-teal-600',
    red: 'from-red-500 to-red-600',
    gray: 'from-gray-500 to-gray-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="border-2 border-gray-100">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-1 capitalize">{subtitle}</p>
              )}
            </div>
            <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * Progress Log Item Component
 */
function ProgressLogItem({
  log,
  index,
  isExpanded,
  onToggle,
  annotation,
  isEditingAnnotation,
  onEditAnnotation,
  onSaveAnnotation,
  onCancelAnnotation,
  showAnnotations
}) {
  const [annotationText, setAnnotationText] = useState(annotation || '');

  const getScoreColor = (score) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  };

  const scoreColor = getScoreColor(log.score);
  const colorClasses = {
    green: { bg: 'bg-green-500', ring: 'ring-green-200', text: 'text-green-600' },
    yellow: { bg: 'bg-yellow-500', ring: 'ring-yellow-200', text: 'text-yellow-600' },
    red: { bg: 'bg-red-500', ring: 'ring-red-200', text: 'text-red-600' }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative"
    >
      {/* Timeline Dot */}
      <div className={`
        absolute -left-[1.6rem] top-3 w-4 h-4 rounded-full ${colorClasses[scoreColor].bg}
        ring-4 ring-white shadow-md
      `} />

      {/* Log Card */}
      <Card className="border-2 border-gray-100 hover:border-gray-200 transition-colors">
        <CardContent className="pt-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">
                    {format(parseISO(log.date), 'EEEE, MMMM d, yyyy')}
                  </span>
                </div>

                {/* Score */}
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Score</span>
                      <span className={`text-lg font-bold ${colorClasses[scoreColor].text}`}>
                        {log.score}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${colorClasses[scoreColor].bg}`}
                        style={{ width: `${log.score}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 border-t space-y-3">
                    {/* Notes */}
                    {log.notes && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Notes</p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {log.notes}
                        </p>
                      </div>
                    )}

                    {/* Annotations */}
                    {showAnnotations && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-gray-700">Annotation</p>
                          {!isEditingAnnotation && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={onEditAnnotation}
                            >
                              <MessageSquare className="w-4 h-4 mr-1" />
                              {annotation ? 'Edit' : 'Add'}
                            </Button>
                          )}
                        </div>

                        {isEditingAnnotation ? (
                          <div className="space-y-2">
                            <Textarea
                              value={annotationText}
                              onChange={(e) => setAnnotationText(e.target.value)}
                              placeholder="Add an annotation..."
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => onSaveAnnotation(annotationText)}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={onCancelAnnotation}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : annotation ? (
                          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                            <p className="text-sm text-gray-700">{annotation}</p>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * Custom Chart Components
 */
function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
      <p className="font-semibold text-gray-900 mb-1">{data.goalName}</p>
      <p className="text-sm text-gray-600 mb-2">
        {format(parseISO(data.date), 'MMM d, yyyy')}
      </p>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-[#65A39B] rounded-full" />
        <span className="text-sm font-medium">Score: {data.score}</span>
      </div>
      {data.notes && (
        <p className="text-xs text-gray-500 mt-2 max-w-xs">{data.notes}</p>
      )}
    </div>
  );
}

function CustomDot({ cx, cy, payload }) {
  const getColor = (score) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      fill={getColor(payload.score)}
      stroke="white"
      strokeWidth={2}
    />
  );
}

function Label({ className, children }) {
  return <label className={`text-sm font-medium ${className}`}>{children}</label>;
}
