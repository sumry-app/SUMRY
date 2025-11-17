import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  CheckCircle,
  Activity,
  Download,
  Calendar,
  BarChart3,
  RefreshCw,
  Filter
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  generateAnalyticsSummary,
  generateTimeSeriesData,
  calculateMovingAverage,
  analyzeTrend
} from '@/lib/analytics';
import ProgressChart from './ProgressChart';
import GoalDistribution from './GoalDistribution';
import StudentPerformance from './StudentPerformance';

const TIME_RANGES = [
  { label: '7 Days', value: 7 },
  { label: '30 Days', value: 30 },
  { label: '90 Days', value: 90 },
  { label: 'All Time', value: null }
];

/**
 * Advanced Analytics Dashboard
 * Main dashboard component with comprehensive analytics and visualizations
 */
export default function AnalyticsDashboard({ students = [], goals = [], logs = [] }) {
  const [timeRange, setTimeRange] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedView, setSelectedView] = useState('overview');

  // Simulate real-time updates
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 500);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Filter data by time range
  const filteredLogs = useMemo(() => {
    if (timeRange === null) return logs;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeRange);

    return logs.filter(log => {
      const logDate = new Date(log.dateISO || log.date);
      return logDate >= cutoffDate;
    });
  }, [logs, timeRange]);

  // Calculate analytics summary
  const summary = useMemo(() => {
    return generateAnalyticsSummary(students, goals, filteredLogs);
  }, [students, goals, filteredLogs]);

  // Generate time series data for charts
  const timeSeriesData = useMemo(() => {
    return generateTimeSeriesData(filteredLogs, timeRange || 365);
  }, [filteredLogs, timeRange]);

  // Calculate moving average
  const movingAvgData = useMemo(() => {
    if (timeSeriesData.length === 0) return [];

    const avgScores = timeSeriesData.map(d => d.avgScore);
    const movingAvg = calculateMovingAverage(avgScores, 3);

    return timeSeriesData.map((item, index) => ({
      ...item,
      movingAvg: movingAvg.find(ma => ma.index === index)?.value || null
    }));
  }, [timeSeriesData]);

  // Export data
  const handleExport = (format) => {
    const dataToExport = {
      summary,
      timeSeriesData,
      students: students.length,
      goals: goals.length,
      logs: filteredLogs.length,
      exportedAt: new Date().toISOString()
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sumry-analytics-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      const csvRows = [
        ['Metric', 'Value'],
        ['Total Students', summary.totalStudents],
        ['Total Goals', summary.totalGoals],
        ['Total Logs', summary.totalLogs],
        ['On Track %', summary.onTrackPercentage],
        ['Completion Rate %', summary.completionRate],
        ['Avg Score', summary.avgScore.toFixed(2)],
        ['Median Score', summary.medianScore.toFixed(2)]
      ];

      const csv = csvRows.map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sumry-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  // Empty state
  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <BarChart3 className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Data Available</h3>
        <p className="text-gray-500 text-center max-w-md">
          Add students and track their progress to see comprehensive analytics and insights.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-500 mt-1">
            Comprehensive insights and progress tracking
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="w-4 h-4 mr-2" />
            {autoRefresh ? 'Auto On' : 'Auto Off'}
          </Button>

          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleExport('json')}
              className="h-8"
            >
              <Download className="w-4 h-4 mr-1" />
              JSON
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleExport('csv')}
              className="h-8"
            >
              <Download className="w-4 h-4 mr-1" />
              CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Time Range Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Time Range:</span>
            </div>
            <div className="flex gap-2">
              {TIME_RANGES.map((range) => (
                <Button
                  key={range.label}
                  variant={timeRange === range.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(range.value)}
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <AnimatePresence mode="wait">
        <motion.div
          key={timeRange}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <MetricCard
            title="Total Students"
            value={summary.totalStudents}
            icon={Users}
            color="blue"
            loading={isLoading}
          />
          <MetricCard
            title="Active Goals"
            value={summary.totalGoals}
            icon={Target}
            color="purple"
            loading={isLoading}
          />
          <MetricCard
            title="On Track"
            value={`${summary.onTrackPercentage}%`}
            subtitle={`${summary.onTrackCount} of ${summary.totalGoals} goals`}
            icon={CheckCircle}
            color="green"
            trend={summary.overallTrend}
            loading={isLoading}
          />
          <MetricCard
            title="Completion Rate"
            value={`${summary.completionRate}%`}
            subtitle={`Avg Score: ${summary.avgScore.toFixed(1)}`}
            icon={TrendingUp}
            color="teal"
            loading={isLoading}
          />
        </motion.div>
      </AnimatePresence>

      {/* Progress Over Time Chart */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`chart-${timeRange}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Progress Over Time</CardTitle>
                <Badge variant="outline">
                  {timeSeriesData.length} data points
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {timeSeriesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={movingAvgData}>
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
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis stroke="#6B7280" fontSize={12} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                      labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="avgScore"
                      stroke="#65A39B"
                      strokeWidth={2}
                      fill="url(#colorScore)"
                      name="Average Score"
                      animationDuration={1000}
                    />
                    <Line
                      type="monotone"
                      dataKey="movingAvg"
                      stroke="#E3866B"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="Trend (3-day MA)"
                      animationDuration={1000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="No progress data available for this time range" />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* View Tabs */}
      <div className="flex gap-2 border-b">
        {['overview', 'progress', 'goals', 'students'].map((view) => (
          <button
            key={view}
            onClick={() => setSelectedView(view)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              selectedView === view
                ? 'text-[#65A39B] border-b-2 border-[#65A39B]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {view}
          </button>
        ))}
      </div>

      {/* Dynamic Content Based on Selected View */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {selectedView === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GoalDistribution goals={goals} logs={filteredLogs} />
              <Card>
                <CardHeader>
                  <CardTitle>Data Quality Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Overall Quality</span>
                        <span className="text-2xl font-bold text-[#65A39B]">
                          {summary.dataQuality.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-[#65A39B] to-[#E3866B] h-3 rounded-full transition-all duration-1000"
                          style={{ width: `${summary.dataQuality}%` }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {summary.totalLogs}
                        </div>
                        <div className="text-xs text-blue-800 mt-1">Total Logs</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {(summary.totalLogs / Math.max(summary.totalGoals, 1)).toFixed(1)}
                        </div>
                        <div className="text-xs text-purple-800 mt-1">Logs per Goal</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {selectedView === 'progress' && (
            <ProgressChart goals={goals} logs={filteredLogs} students={students} />
          )}

          {selectedView === 'goals' && (
            <div className="space-y-6">
              <GoalDistribution goals={goals} logs={filteredLogs} />
              <TrendAnalysisCard trend={summary.overallTrend} />
            </div>
          )}

          {selectedView === 'students' && (
            <StudentPerformance students={students} goals={goals} logs={filteredLogs} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon: Icon, color, trend, loading }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    teal: 'from-teal-500 to-teal-600',
    red: 'from-red-500 to-red-600'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-2 border-gray-100 hover:border-gray-200 transition-all shadow-sm hover:shadow-md">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
              {loading ? (
                <div className="h-10 w-24 bg-gray-200 animate-pulse rounded" />
              ) : (
                <motion.p
                  key={value}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-4xl font-bold text-gray-900"
                >
                  {value}
                </motion.p>
              )}
              {subtitle && (
                <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
              )}
              {trend && (
                <div className="flex items-center gap-1 mt-2">
                  {trend.direction === 'improving' ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : trend.direction === 'declining' ? (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  ) : null}
                  <span className={`text-xs font-medium capitalize ${
                    trend.direction === 'improving' ? 'text-green-600' :
                    trend.direction === 'declining' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {trend.direction}
                  </span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function EmptyChart({ message }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
      <BarChart3 className="w-16 h-16 mb-4" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

function TrendAnalysisCard({ trend }) {
  const getTrendColor = (direction) => {
    if (direction === 'improving') return 'text-green-600 bg-green-50 border-green-200';
    if (direction === 'declining') return 'text-red-600 bg-red-50 border-red-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getTrendIcon = (direction) => {
    if (direction === 'improving') return TrendingUp;
    if (direction === 'declining') return TrendingDown;
    return Activity;
  };

  const Icon = getTrendIcon(trend.direction);

  return (
    <Card className={`border-2 ${getTrendColor(trend.direction)}`}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5" />
          <CardTitle>Overall Trend Analysis</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Direction:</span>
            <Badge variant="outline" className="capitalize">
              {trend.direction}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Strength:</span>
            <Badge variant="outline" className="capitalize">
              {trend.strength}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Confidence:</span>
            <span className="text-sm font-bold">
              {trend.confidence.toFixed(1)}%
            </span>
          </div>
          <div className="pt-3 border-t">
            <p className="text-sm text-gray-600">
              {trend.direction === 'improving' && (
                "Students are showing positive progress trends. Continue current strategies."
              )}
              {trend.direction === 'declining' && (
                "Progress trends are declining. Consider intervention strategies."
              )}
              {trend.direction === 'stable' && (
                "Progress is stable. Monitor for changes and adjust strategies as needed."
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
