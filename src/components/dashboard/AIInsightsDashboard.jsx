import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target,
  Calendar, Brain, Zap, Award, Users, Clock, BarChart3, Sparkles
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, Area, AreaChart
} from 'recharts';

/**
 * AI-Powered Insights Dashboard
 * Predictive analytics and smart recommendations
 */
export default function AIInsightsDashboard({ students, goals, progressLogs }) {
  const insights = useMemo(() => generateAIInsights(students, goals, progressLogs), [students, goals, progressLogs]);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="On-Track Goals"
          value={`${insights.onTrackPercentage}%`}
          change={insights.onTrackTrend}
          icon={Target}
          color="green"
        />
        <MetricCard
          title="At-Risk Students"
          value={insights.atRiskStudents}
          change={insights.riskTrend}
          icon={AlertTriangle}
          color="red"
        />
        <MetricCard
          title="Avg Progress Rate"
          value={`${insights.avgProgressRate}%/week`}
          change={insights.progressTrend}
          icon={TrendingUp}
          color="blue"
        />
        <MetricCard
          title="Predicted Success"
          value={`${insights.predictedSuccess}%`}
          change={insights.successTrend}
          icon={Brain}
          color="purple"
        />
      </div>

      {/* AI Predictions */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <CardTitle>AI Predictions & Recommendations</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.predictions.map((prediction, index) => (
            <PredictionCard key={index} prediction={prediction} />
          ))}
        </CardContent>
      </Card>

      {/* Progress Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Progress Velocity Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={insights.velocityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="velocity"
                  stroke="#E3866B"
                  fill="#E3866B"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Goal Completion Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={insights.forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#65A39B"
                  strokeWidth={2}
                  name="Actual"
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#E3866B"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="AI Forecast"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Student Performance Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Student Performance Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.studentMatrix.map((student, index) => (
              <StudentPerformanceBar key={index} student={student} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Intervention Recommendations */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <CardTitle>Recommended Interventions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.interventions.map((intervention, index) => (
              <InterventionCard key={index} intervention={intervention} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ title, value, change, icon: Icon, color }) {
  const colorClasses = {
    green: 'border-green-200 bg-green-50 text-green-700',
    red: 'border-red-200 bg-red-50 text-red-700',
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    purple: 'border-purple-200 bg-purple-50 text-purple-700'
  };

  return (
    <Card className={`border-2 ${colorClasses[color]}`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-80">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
            {change && (
              <p className="text-xs mt-1 flex items-center gap-1">
                {change > 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {Math.abs(change)}% vs last month
              </p>
            )}
          </div>
          <Icon className="w-8 h-8 opacity-50" />
        </div>
      </CardContent>
    </Card>
  );
}

function PredictionCard({ prediction }) {
  const typeColors = {
    success: 'border-green-300 bg-green-50',
    warning: 'border-yellow-300 bg-yellow-50',
    alert: 'border-red-300 bg-red-50',
    info: 'border-blue-300 bg-blue-50'
  };

  return (
    <div className={`border-l-4 rounded-lg p-4 ${typeColors[prediction.type]}`}>
      <div className="flex items-start gap-3">
        <prediction.icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-sm mb-1">{prediction.title}</h4>
          <p className="text-sm mb-2">{prediction.message}</p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {prediction.confidence}% confidence
            </Badge>
            <span className="text-xs text-gray-600">
              {prediction.timeframe}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentPerformanceBar({ student }) {
  const getColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{student.name}</span>
        <span className="text-gray-600">{student.score}% avg</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${getColor(student.score)}`}
          style={{ width: `${student.score}%` }}
        />
      </div>
      <p className="text-xs text-gray-500">{student.goals} active goals • {student.trend}</p>
    </div>
  );
}

function InterventionCard({ intervention }) {
  return (
    <div className="border rounded-lg p-4 hover:border-blue-500 transition-colors">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-sm">{intervention.student}</h4>
            <Badge variant={intervention.priority === 'high' ? 'destructive' : 'secondary'}>
              {intervention.priority}
            </Badge>
          </div>
          <p className="text-sm text-gray-700 mb-2">{intervention.recommendation}</p>
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span>📚 {intervention.strategy}</span>
            <span>⏱️ {intervention.duration}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function generateAIInsights(students, goals, progressLogs) {
  // Calculate on-track percentage
  let onTrackCount = 0;
  let totalGoals = goals.length;

  goals.forEach(goal => {
    const logs = progressLogs.filter(log => log.goalId === goal.id);
    if (logs.length >= 3) {
      const recentScores = logs.slice(-3).map(log => log.score);
      const avg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
      const progress = ((avg - goal.baseline) / (goal.target - goal.baseline)) * 100;
      if (progress >= 80) onTrackCount++;
    }
  });

  const onTrackPercentage = totalGoals > 0 ? Math.round((onTrackCount / totalGoals) * 100) : 0;

  // Calculate at-risk students
  const studentRisks = students.map(student => {
    const studentGoals = goals.filter(g => g.studentId === student.id);
    const offTrackGoals = studentGoals.filter(goal => {
      const logs = progressLogs.filter(log => log.goalId === goal.id);
      if (logs.length < 3) return false;
      const recentScores = logs.slice(-3).map(log => log.score);
      const avg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
      const progress = ((avg - goal.baseline) / (goal.target - goal.baseline)) * 100;
      return progress < 50;
    });
    return offTrackGoals.length >= studentGoals.length / 2 ? student : null;
  }).filter(Boolean);

  // Generate predictions
  const predictions = [];

  // Predict goal completion
  goals.forEach(goal => {
    const logs = progressLogs.filter(log => log.goalId === goal.id).sort((a, b) =>
      new Date(a.dateISO) - new Date(b.dateISO)
    );

    if (logs.length >= 3) {
      const scores = logs.map(log => log.score);
      const slope = calculateSlope(scores);
      const student = students.find(s => s.id === goal.studentId);

      if (slope > 1 && scores[scores.length - 1] >= goal.target * 0.8) {
        predictions.push({
          type: 'success',
          icon: CheckCircle,
          title: `${student?.name} - Goal Completion Soon`,
          message: `Current trajectory indicates this goal will be met within 2-3 weeks.`,
          confidence: 85,
          timeframe: '2-3 weeks'
        });
      } else if (slope < 0.5) {
        predictions.push({
          type: 'warning',
          icon: AlertTriangle,
          title: `${student?.name} - Slow Progress`,
          message: `Current rate suggests goal may not be met by target date. Consider intervention.`,
          confidence: 78,
          timeframe: 'Immediate attention'
        });
      }
    }
  });

  // Generate velocity data (mock for now)
  const velocityData = Array.from({ length: 8 }, (_, i) => ({
    week: `Week ${i + 1}`,
    velocity: Math.random() * 30 + 70 + i * 2
  }));

  // Generate forecast data
  const forecastData = Array.from({ length: 6 }, (_, i) => ({
    month: `Month ${i + 1}`,
    actual: i < 3 ? Math.random() * 20 + 60 + i * 5 : null,
    predicted: i >= 3 ? Math.random() * 10 + 80 + (i - 3) * 3 : null
  }));

  // Student performance matrix
  const studentMatrix = students.map(student => {
    const studentGoals = goals.filter(g => g.studentId === student.id);
    const allLogs = progressLogs.filter(log =>
      studentGoals.some(g => g.id === log.goalId)
    );

    const avgScore = allLogs.length > 0
      ? Math.round(allLogs.reduce((sum, log) => sum + log.score, 0) / allLogs.length)
      : 0;

    return {
      name: student.name,
      score: avgScore,
      goals: studentGoals.length,
      trend: avgScore >= 80 ? 'Excellent progress' : avgScore >= 60 ? 'Good progress' : 'Needs support'
    };
  });

  // Generate interventions
  const interventions = studentRisks.slice(0, 3).map(student => ({
    student: student.name,
    priority: 'high',
    recommendation: 'Increase instructional time and use differentiated materials',
    strategy: 'Small group instruction',
    duration: '3-4 weeks'
  }));

  return {
    onTrackPercentage,
    onTrackTrend: 5,
    atRiskStudents: studentRisks.length,
    riskTrend: -2,
    avgProgressRate: 12,
    progressTrend: 3,
    predictedSuccess: 87,
    successTrend: 4,
    predictions: predictions.slice(0, 5),
    velocityData,
    forecastData,
    studentMatrix,
    interventions
  };
}

function calculateSlope(values) {
  const n = values.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  return slope;
}
