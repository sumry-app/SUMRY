import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  ReferenceArea,
  Scatter,
  ScatterChart,
  ZAxis
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Target,
  AlertCircle
} from 'lucide-react';
import {
  calculateTrendline,
  predictFutureValues,
  analyzeTrend,
  detectAnomalies,
  parseScore
} from '@/lib/analytics';

const COLORS = {
  primary: '#65A39B',
  secondary: '#E3866B',
  tertiary: '#9CA3AF',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444'
};

/**
 * Advanced Progress Chart Component
 * Multi-line charts with trendlines, predictions, and interactive features
 */
export default function ProgressChart({ goals = [], logs = [], students = [] }) {
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [showTrendline, setShowTrendline] = useState(true);
  const [showPredictions, setShowPredictions] = useState(false);
  const [showAnomalies, setShowAnomalies] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Prepare chart data for selected goals
  const chartData = useMemo(() => {
    if (selectedGoals.length === 0 && goals.length > 0) {
      // Auto-select first 3 goals
      const autoSelected = goals.slice(0, 3).map(g => g.id);
      setSelectedGoals(autoSelected);
      return prepareChartData(goals.slice(0, 3), logs, students);
    }

    const goalsToShow = goals.filter(g => selectedGoals.includes(g.id));
    return prepareChartData(goalsToShow, logs, students);
  }, [goals, logs, students, selectedGoals]);

  // Toggle goal selection
  const toggleGoal = (goalId) => {
    setSelectedGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  // Zoom controls
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 2));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  const handleResetZoom = () => setZoomLevel(1);

  if (goals.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No goals available to display progress</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Display Options:</span>
              <Button
                variant={showTrendline ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowTrendline(!showTrendline)}
              >
                Trendline
              </Button>
              <Button
                variant={showPredictions ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowPredictions(!showPredictions)}
              >
                Predictions
              </Button>
              <Button
                variant={showAnomalies ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowAnomalies(!showAnomalies)}
              >
                Anomalies
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleResetZoom}>
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Badge variant="outline">
                {(zoomLevel * 100).toFixed(0)}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Student Progress Tracking</CardTitle>
            <Badge variant="outline">
              {selectedGoals.length} goal{selectedGoals.length !== 1 ? 's' : ''} selected
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.series.length > 0 ? (
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={400 * zoomLevel}>
                <LineChart data={chartData.timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="date"
                    stroke="#6B7280"
                    fontSize={12}
                    tickFormatter={(date) =>
                      new Date(date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })
                    }
                  />
                  <YAxis
                    stroke="#6B7280"
                    fontSize={12}
                    domain={[0, 100]}
                    label={{ value: 'Score', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    content={<CustomTooltip hoveredPoint={hoveredPoint} />}
                  />
                  <Legend />

                  {/* Reference lines for targets */}
                  {chartData.series.map((series, index) => (
                    series.target && (
                      <ReferenceLine
                        key={`target-${index}`}
                        y={series.target}
                        stroke={series.color}
                        strokeDasharray="5 5"
                        strokeOpacity={0.3}
                        label={{
                          value: `Target: ${series.target}`,
                          position: 'right',
                          fontSize: 10,
                          fill: series.color
                        }}
                      />
                    )
                  ))}

                  {/* Progress lines */}
                  {chartData.series.map((series, index) => (
                    <Line
                      key={`line-${index}`}
                      type="monotone"
                      dataKey={series.key}
                      name={series.name}
                      stroke={series.color}
                      strokeWidth={3}
                      dot={{
                        r: 4,
                        strokeWidth: 2,
                        fill: 'white',
                        onMouseEnter: (e, payload) => setHoveredPoint(payload)
                      }}
                      activeDot={{
                        r: 6,
                        onMouseEnter: (e, payload) => setHoveredPoint(payload)
                      }}
                      connectNulls
                      animationDuration={1000}
                    />
                  ))}

                  {/* Trendlines */}
                  {showTrendline && chartData.series.map((series, index) => (
                    series.trendData && (
                      <Line
                        key={`trend-${index}`}
                        type="monotone"
                        dataKey={series.trendKey}
                        stroke={series.color}
                        strokeWidth={2}
                        strokeDasharray="8 4"
                        dot={false}
                        name={`${series.name} Trend`}
                        strokeOpacity={0.5}
                        animationDuration={1000}
                      />
                    )
                  ))}

                  {/* Prediction lines */}
                  {showPredictions && chartData.series.map((series, index) => (
                    series.predictions && series.predictions.length > 0 && (
                      <Line
                        key={`prediction-${index}`}
                        type="monotone"
                        dataKey={series.predictionKey}
                        stroke={series.color}
                        strokeWidth={2}
                        strokeDasharray="3 3"
                        dot={{ r: 3, fill: series.color }}
                        name={`${series.name} Prediction`}
                        strokeOpacity={0.6}
                        animationDuration={1000}
                      />
                    )
                  ))}
                </LineChart>
              </ResponsiveContainer>

              {/* Anomalies Chart */}
              {showAnomalies && chartData.anomalies.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    Detected Anomalies
                  </h4>
                  <ResponsiveContainer width="100%" height={150}>
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis
                        dataKey="date"
                        stroke="#6B7280"
                        fontSize={12}
                        tickFormatter={(date) =>
                          new Date(date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })
                        }
                      />
                      <YAxis stroke="#6B7280" fontSize={12} />
                      <ZAxis range={[50, 200]} />
                      <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        content={<AnomalyTooltip />}
                      />
                      <Scatter
                        data={chartData.anomalies}
                        fill={COLORS.warning}
                        shape="star"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Select goals to view progress</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Goal Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Goals to Display</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {goals.map((goal) => {
              const student = students.find(s => s.id === goal.studentId);
              const goalLogs = logs.filter(l => l.goalId === goal.id);
              const trend = analyzeTrend(goalLogs.map(l => parseScore(l.score)).filter(s => s !== null));

              return (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  student={student}
                  trend={trend}
                  logsCount={goalLogs.length}
                  isSelected={selectedGoals.includes(goal.id)}
                  onToggle={() => toggleGoal(goal.id)}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      {selectedGoals.length > 0 && (
        <Card className="border-2 border-blue-100 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="text-base">Progress Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {chartData.insights.map((insight, index) => (
                <InsightCard key={index} insight={insight} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function prepareChartData(goals, logs, students) {
  const series = [];
  const allDates = new Set();
  const anomalies = [];
  const insights = [];

  const goalColors = [
    COLORS.primary,
    COLORS.secondary,
    '#8B5CF6',
    '#EC4899',
    '#F59E0B',
    '#3B82F6'
  ];

  goals.forEach((goal, index) => {
    const goalLogs = logs
      .filter(l => l.goalId === goal.id)
      .sort((a, b) => new Date(a.dateISO) - new Date(b.dateISO));

    if (goalLogs.length === 0) return;

    const student = students.find(s => s.id === goal.studentId);
    const color = goalColors[index % goalColors.length];
    const key = `goal_${goal.id}`;
    const trendKey = `trend_${goal.id}`;
    const predictionKey = `pred_${goal.id}`;

    // Extract scores
    const scores = goalLogs.map(log => parseScore(log.score)).filter(s => s !== null);

    // Calculate trendline
    const trendline = calculateTrendline(scores);

    // Calculate predictions
    const predictions = predictFutureValues(scores, 3);

    // Detect anomalies
    const goalAnomalies = detectAnomalies(goalLogs);
    goalAnomalies.forEach(anomaly => {
      anomalies.push({
        date: anomaly.data.dateISO,
        value: anomaly.value,
        zScore: anomaly.zScore,
        type: anomaly.type,
        goalName: `${student?.name || 'Unknown'} - ${goal.area}`
      });
    });

    // Analyze trend
    const trend = analyzeTrend(scores);

    // Add insight
    insights.push({
      goalName: `${student?.name || 'Unknown'} - ${goal.area}`,
      trend: trend.direction,
      strength: trend.strength,
      confidence: trend.confidence,
      dataPoints: scores.length,
      color
    });

    // Add dates to set
    goalLogs.forEach(log => allDates.add(log.dateISO));

    // Add prediction dates
    if (predictions.length > 0) {
      const lastDate = new Date(goalLogs[goalLogs.length - 1].dateISO);
      predictions.forEach((pred, i) => {
        const futureDate = new Date(lastDate);
        futureDate.setDate(futureDate.getDate() + (i + 1) * 7);
        allDates.add(futureDate.toISOString().split('T')[0]);
      });
    }

    series.push({
      key,
      trendKey,
      predictionKey,
      name: `${student?.name || 'Unknown'} - ${goal.area}`,
      color,
      target: parseScore(goal.target),
      baseline: parseScore(goal.baseline),
      logs: goalLogs,
      trendData: trendline,
      predictions,
      trend
    });
  });

  // Create timeline data
  const sortedDates = Array.from(allDates).sort();
  const timelineData = sortedDates.map(date => {
    const dataPoint = { date };

    series.forEach(s => {
      // Actual data
      const log = s.logs.find(l => l.dateISO === date);
      dataPoint[s.key] = log ? parseScore(log.score) : null;

      // Trendline data
      if (s.trendData) {
        const logIndex = s.logs.findIndex(l => l.dateISO === date);
        if (logIndex >= 0) {
          dataPoint[s.trendKey] = s.trendData.slope * logIndex + s.trendData.intercept;
        }
      }

      // Prediction data
      if (s.predictions && s.predictions.length > 0) {
        const lastLogDate = s.logs[s.logs.length - 1].dateISO;
        const lastDate = new Date(lastLogDate);
        const currentDate = new Date(date);
        const daysDiff = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));

        if (daysDiff > 0 && daysDiff <= s.predictions.length * 7) {
          const predIndex = Math.floor(daysDiff / 7);
          if (s.predictions[predIndex]) {
            dataPoint[s.predictionKey] = s.predictions[predIndex].value;
          }
        }
      }
    });

    return dataPoint;
  });

  return { series, timelineData, anomalies, insights };
}

function GoalCard({ goal, student, trend, logsCount, isSelected, onToggle }) {
  const getTrendIcon = (direction) => {
    if (direction === 'improving') return TrendingUp;
    if (direction === 'declining') return TrendingDown;
    return Minus;
  };

  const getTrendColor = (direction) => {
    if (direction === 'improving') return 'text-green-600';
    if (direction === 'declining') return 'text-red-600';
    return 'text-gray-600';
  };

  const Icon = getTrendIcon(trend.direction);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <button
        onClick={onToggle}
        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
          isSelected
            ? 'border-[#65A39B] bg-[#65A39B]/5 shadow-md'
            : 'border-gray-200 hover:border-gray-300 bg-white'
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="font-semibold text-sm text-gray-900 mb-1">
              {student?.name || 'Unknown Student'}
            </div>
            <div className="text-xs text-gray-600">{goal.area}</div>
          </div>
          <div className={`p-1 rounded ${getTrendColor(trend.direction)}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {logsCount} logs
          </Badge>
          <Badge variant="outline" className="text-xs capitalize">
            {trend.direction}
          </Badge>
        </div>
      </button>
    </motion.div>
  );
}

function CustomTooltip({ active, payload, label, hoveredPoint }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg shadow-lg p-3 max-w-xs">
      <p className="font-semibold text-sm mb-2">
        {new Date(label).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </p>
      <div className="space-y-1">
        {payload.map((entry, index) => (
          entry.value !== null && (
            <div key={index} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-gray-600">{entry.name}:</span>
              </div>
              <span className="text-sm font-bold">{entry.value.toFixed(1)}</span>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

function AnomalyTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-white border-2 border-orange-200 rounded-lg shadow-lg p-3">
      <p className="font-semibold text-sm mb-1 text-orange-700">Anomaly Detected</p>
      <p className="text-xs text-gray-600 mb-2">{data.goalName}</p>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-3">
          <span>Value:</span>
          <span className="font-semibold">{data.value.toFixed(1)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span>Z-Score:</span>
          <span className="font-semibold">{data.zScore.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span>Type:</span>
          <Badge variant="outline" className="text-xs capitalize">
            {data.type}
          </Badge>
        </div>
      </div>
    </div>
  );
}

function InsightCard({ insight }) {
  const getTrendColor = (direction) => {
    if (direction === 'improving') return 'bg-green-100 text-green-800';
    if (direction === 'declining') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: insight.color }}
        />
        <div className="text-sm font-medium text-gray-900 truncate">
          {insight.goalName}
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Trend:</span>
          <Badge className={`text-xs capitalize ${getTrendColor(insight.trend)}`}>
            {insight.trend}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Strength:</span>
          <span className="text-xs font-medium capitalize">{insight.strength}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Data Points:</span>
          <span className="text-xs font-medium">{insight.dataPoints}</span>
        </div>
      </div>
    </div>
  );
}
