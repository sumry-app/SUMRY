/**
 * Advanced Analytics Calculation Engine for SUMRY
 * Provides statistical analysis, trend detection, predictions, and performance metrics
 */

import { parseScore } from './data';

/**
 * Calculate mean (average) of an array of numbers
 */
export function calculateMean(values) {
  if (!values || values.length === 0) return 0;
  const validValues = values.filter(v => typeof v === 'number' && !isNaN(v));
  if (validValues.length === 0) return 0;
  return validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
}

/**
 * Calculate median of an array of numbers
 */
export function calculateMedian(values) {
  if (!values || values.length === 0) return 0;
  const validValues = values
    .filter(v => typeof v === 'number' && !isNaN(v))
    .sort((a, b) => a - b);

  if (validValues.length === 0) return 0;

  const mid = Math.floor(validValues.length / 2);
  if (validValues.length % 2 === 0) {
    return (validValues[mid - 1] + validValues[mid]) / 2;
  }
  return validValues[mid];
}

/**
 * Calculate standard deviation
 */
export function calculateStdDev(values) {
  if (!values || values.length < 2) return 0;
  const validValues = values.filter(v => typeof v === 'number' && !isNaN(v));
  if (validValues.length < 2) return 0;

  const mean = calculateMean(validValues);
  const squaredDiffs = validValues.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / validValues.length;
  return Math.sqrt(variance);
}

/**
 * Calculate percentile (e.g., 25th, 50th, 75th)
 */
export function calculatePercentile(values, percentile) {
  if (!values || values.length === 0) return 0;
  const validValues = values
    .filter(v => typeof v === 'number' && !isNaN(v))
    .sort((a, b) => a - b);

  if (validValues.length === 0) return 0;

  const index = (percentile / 100) * (validValues.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  if (lower === upper) return validValues[lower];
  return validValues[lower] * (1 - weight) + validValues[upper] * weight;
}

/**
 * Calculate linear regression trendline
 */
export function calculateTrendline(data) {
  if (!data || data.length < 2) return null;

  const points = data
    .map((d, i) => ({ x: i, y: typeof d === 'number' ? d : parseScore(d.score) }))
    .filter(p => p.y !== null);

  if (points.length < 2) return null;

  const n = points.length;
  const sumX = points.reduce((sum, p) => sum + p.x, 0);
  const sumY = points.reduce((sum, p) => sum + p.y, 0);
  const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
  const sumX2 = points.reduce((sum, p) => sum + p.x * p.x, 0);

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) return null;

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R-squared for trend strength
  const meanY = sumY / n;
  const ssTotal = points.reduce((sum, p) => sum + Math.pow(p.y - meanY, 2), 0);
  const ssResidual = points.reduce((sum, p) => {
    const predicted = slope * p.x + intercept;
    return sum + Math.pow(p.y - predicted, 2);
  }, 0);
  const rSquared = 1 - (ssResidual / ssTotal);

  return { slope, intercept, rSquared, points };
}

/**
 * Predict future values based on trendline
 */
export function predictFutureValues(data, periods = 3) {
  const trendline = calculateTrendline(data);
  if (!trendline) return [];

  const predictions = [];
  const startIndex = data.length;

  for (let i = 0; i < periods; i++) {
    const x = startIndex + i;
    const predicted = trendline.slope * x + trendline.intercept;
    predictions.push({
      index: x,
      value: Math.max(0, predicted),
      confidence: Math.max(0, trendline.rSquared * 100)
    });
  }

  return predictions;
}

/**
 * Analyze trend direction and strength
 */
export function analyzeTrend(data) {
  const trendline = calculateTrendline(data);
  if (!trendline) {
    return { direction: 'stable', strength: 'none', slope: 0, confidence: 0 };
  }

  const absSlope = Math.abs(trendline.slope);
  let strength = 'weak';
  if (absSlope > 2) strength = 'strong';
  else if (absSlope > 0.5) strength = 'moderate';

  let direction = 'stable';
  if (trendline.slope > 0.1) direction = 'improving';
  else if (trendline.slope < -0.1) direction = 'declining';

  return {
    direction,
    strength,
    slope: trendline.slope,
    confidence: trendline.rSquared * 100
  };
}

/**
 * Calculate performance score based on multiple factors
 */
export function calculatePerformanceScore(logs, baseline, target) {
  if (!logs || logs.length === 0) return null;

  const scores = logs.map(log => parseScore(log.score)).filter(s => s !== null);
  if (scores.length === 0) return null;

  const baselineNum = parseScore(baseline);
  const targetNum = parseScore(target);

  if (baselineNum === null || targetNum === null) return null;

  const latestScore = scores[scores.length - 1];
  const progressPercent = ((latestScore - baselineNum) / (targetNum - baselineNum)) * 100;
  const trend = analyzeTrend(scores);
  const consistency = 100 - (calculateStdDev(scores) / calculateMean(scores)) * 100;

  // Weighted performance score
  const performanceScore = (
    progressPercent * 0.5 +
    (trend.direction === 'improving' ? 30 : trend.direction === 'declining' ? -10 : 10) +
    consistency * 0.2
  );

  return {
    score: Math.max(0, Math.min(100, performanceScore)),
    progress: progressPercent,
    trend: trend.direction,
    consistency: Math.max(0, Math.min(100, consistency)),
    dataPoints: scores.length
  };
}

/**
 * Perform cohort analysis to compare groups of students
 */
export function performCohortAnalysis(students, goals, logs, groupBy = 'grade') {
  const cohorts = {};

  students.forEach(student => {
    const cohortKey = student[groupBy] || 'unspecified';

    if (!cohorts[cohortKey]) {
      cohorts[cohortKey] = {
        name: cohortKey,
        studentCount: 0,
        totalGoals: 0,
        completedGoals: 0,
        avgProgress: 0,
        avgScore: 0,
        students: []
      };
    }

    cohorts[cohortKey].studentCount++;
    cohorts[cohortKey].students.push(student);

    const studentGoals = goals.filter(g => g.studentId === student.id);
    cohorts[cohortKey].totalGoals += studentGoals.length;

    let totalProgress = 0;
    let totalScore = 0;
    let scoreCount = 0;

    studentGoals.forEach(goal => {
      const goalLogs = logs.filter(l => l.goalId === goal.id);
      const scores = goalLogs.map(log => parseScore(log.score)).filter(s => s !== null);

      if (scores.length > 0) {
        const latestScore = scores[scores.length - 1];
        totalScore += latestScore;
        scoreCount++;

        const baselineNum = parseScore(goal.baseline);
        const targetNum = parseScore(goal.target);

        if (baselineNum !== null && targetNum !== null) {
          const progress = ((latestScore - baselineNum) / (targetNum - baselineNum)) * 100;
          totalProgress += progress;

          if (progress >= 100) {
            cohorts[cohortKey].completedGoals++;
          }
        }
      }
    });

    if (scoreCount > 0) {
      cohorts[cohortKey].avgScore = totalScore / scoreCount;
      cohorts[cohortKey].avgProgress = totalProgress / scoreCount;
    }
  });

  return Object.values(cohorts);
}

/**
 * Time series analysis with moving averages
 */
export function calculateMovingAverage(data, windowSize = 3) {
  if (!data || data.length < windowSize) return [];

  const movingAverages = [];

  for (let i = windowSize - 1; i < data.length; i++) {
    const window = data.slice(i - windowSize + 1, i + 1);
    const values = window.map(d =>
      typeof d === 'number' ? d : parseScore(d.score)
    ).filter(v => v !== null);

    if (values.length > 0) {
      movingAverages.push({
        index: i,
        value: calculateMean(values),
        date: data[i].dateISO || data[i].date
      });
    }
  }

  return movingAverages;
}

/**
 * Detect anomalies in progress data
 */
export function detectAnomalies(data, threshold = 2) {
  if (!data || data.length < 3) return [];

  const values = data.map(d =>
    typeof d === 'number' ? d : parseScore(d.score)
  ).filter(v => v !== null);

  const mean = calculateMean(values);
  const stdDev = calculateStdDev(values);

  const anomalies = [];

  data.forEach((item, index) => {
    const value = typeof item === 'number' ? item : parseScore(item.score);
    if (value === null) return;

    const zScore = Math.abs((value - mean) / stdDev);

    if (zScore > threshold) {
      anomalies.push({
        index,
        value,
        zScore,
        type: value > mean ? 'high' : 'low',
        data: item
      });
    }
  });

  return anomalies;
}

/**
 * Calculate velocity (rate of change)
 */
export function calculateVelocity(data, timeWindow = 7) {
  if (!data || data.length < 2) return [];

  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.dateISO || a.date);
    const dateB = new Date(b.dateISO || b.date);
    return dateA - dateB;
  });

  const velocities = [];

  for (let i = 1; i < sortedData.length; i++) {
    const current = parseScore(sortedData[i].score);
    const previous = parseScore(sortedData[i - 1].score);

    if (current === null || previous === null) continue;

    const currentDate = new Date(sortedData[i].dateISO || sortedData[i].date);
    const previousDate = new Date(sortedData[i - 1].dateISO || sortedData[i - 1].date);
    const daysDiff = (currentDate - previousDate) / (1000 * 60 * 60 * 24);

    if (daysDiff > 0) {
      velocities.push({
        index: i,
        velocity: (current - previous) / daysDiff,
        date: sortedData[i].dateISO || sortedData[i].date,
        score: current
      });
    }
  }

  return velocities;
}

/**
 * Generate comprehensive analytics summary
 */
export function generateAnalyticsSummary(students, goals, logs) {
  const totalStudents = students.length;
  const totalGoals = goals.length;
  const totalLogs = logs.length;

  // Calculate on-track percentage
  let onTrackCount = 0;
  let offTrackCount = 0;
  let insufficientDataCount = 0;

  const allScores = [];

  goals.forEach(goal => {
    const goalLogs = logs.filter(l => l.goalId === goal.id);
    const scores = goalLogs.map(log => parseScore(log.score)).filter(s => s !== null);

    allScores.push(...scores);

    if (scores.length < 3) {
      insufficientDataCount++;
    } else {
      const performance = calculatePerformanceScore(goalLogs, goal.baseline, goal.target);
      if (performance && performance.progress >= 80) {
        onTrackCount++;
      } else {
        offTrackCount++;
      }
    }
  });

  const onTrackPercentage = totalGoals > 0
    ? Math.round((onTrackCount / totalGoals) * 100)
    : 0;

  const completionRate = totalGoals > 0
    ? Math.round((onTrackCount / totalGoals) * 100)
    : 0;

  // Overall trend
  const overallTrend = allScores.length > 0
    ? analyzeTrend(allScores)
    : { direction: 'stable', strength: 'none' };

  return {
    totalStudents,
    totalGoals,
    totalLogs,
    onTrackCount,
    offTrackCount,
    insufficientDataCount,
    onTrackPercentage,
    completionRate,
    avgScore: allScores.length > 0 ? calculateMean(allScores) : 0,
    medianScore: allScores.length > 0 ? calculateMedian(allScores) : 0,
    overallTrend,
    dataQuality: totalLogs > 0 ? Math.min(100, (totalLogs / totalGoals) * 20) : 0
  };
}

/**
 * Calculate goal area distribution
 */
export function calculateGoalAreaDistribution(goals) {
  const distribution = {};

  goals.forEach(goal => {
    const area = goal.area || 'General';
    if (!distribution[area]) {
      distribution[area] = { area, count: 0, percentage: 0 };
    }
    distribution[area].count++;
  });

  const total = goals.length;
  Object.values(distribution).forEach(item => {
    item.percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
  });

  return Object.values(distribution).sort((a, b) => b.count - a.count);
}

/**
 * Calculate goal status distribution
 */
export function calculateGoalStatusDistribution(goals, logs) {
  const distribution = {
    onTrack: { status: 'On Track', count: 0, percentage: 0, color: '#65A39B' },
    offTrack: { status: 'Off Track', count: 0, percentage: 0, color: '#E3866B' },
    needsData: { status: 'Needs Data', count: 0, percentage: 0, color: '#9CA3AF' },
    completed: { status: 'Completed', count: 0, percentage: 0, color: '#10B981' }
  };

  goals.forEach(goal => {
    const goalLogs = logs.filter(l => l.goalId === goal.id);
    const scores = goalLogs.map(log => parseScore(log.score)).filter(s => s !== null);

    if (scores.length < 3) {
      distribution.needsData.count++;
    } else {
      const performance = calculatePerformanceScore(goalLogs, goal.baseline, goal.target);
      if (performance) {
        if (performance.progress >= 100) {
          distribution.completed.count++;
        } else if (performance.progress >= 80) {
          distribution.onTrack.count++;
        } else {
          distribution.offTrack.count++;
        }
      } else {
        distribution.needsData.count++;
      }
    }
  });

  const total = goals.length;
  Object.values(distribution).forEach(item => {
    item.percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
  });

  return Object.values(distribution);
}

/**
 * Generate time-based progress data for charts
 */
export function generateTimeSeriesData(logs, timeRange = 30) {
  const now = new Date();
  const startDate = new Date(now.getTime() - timeRange * 24 * 60 * 60 * 1000);

  // Group logs by date
  const dateGroups = {};

  logs.forEach(log => {
    const logDate = new Date(log.dateISO || log.date);
    if (logDate >= startDate) {
      const dateKey = logDate.toISOString().split('T')[0];
      if (!dateGroups[dateKey]) {
        dateGroups[dateKey] = [];
      }
      const score = parseScore(log.score);
      if (score !== null) {
        dateGroups[dateKey].push(score);
      }
    }
  });

  // Create time series data
  const timeSeriesData = [];
  const sortedDates = Object.keys(dateGroups).sort();

  sortedDates.forEach(date => {
    const scores = dateGroups[date];
    timeSeriesData.push({
      date,
      avgScore: calculateMean(scores),
      minScore: Math.min(...scores),
      maxScore: Math.max(...scores),
      count: scores.length
    });
  });

  return timeSeriesData;
}

/**
 * Calculate student comparison metrics
 */
export function calculateStudentComparisons(students, goals, logs) {
  return students.map(student => {
    const studentGoals = goals.filter(g => g.studentId === student.id);
    const studentLogs = logs.filter(log =>
      studentGoals.some(g => g.id === log.goalId)
    );

    const scores = studentLogs.map(log => parseScore(log.score)).filter(s => s !== null);

    let skillBreakdown = {};
    studentGoals.forEach(goal => {
      const area = goal.area || 'General';
      const goalLogs = logs.filter(l => l.goalId === goal.id);
      const areaScores = goalLogs.map(log => parseScore(log.score)).filter(s => s !== null);

      if (!skillBreakdown[area]) {
        skillBreakdown[area] = [];
      }
      skillBreakdown[area].push(...areaScores);
    });

    const skillAverages = {};
    Object.keys(skillBreakdown).forEach(area => {
      skillAverages[area] = calculateMean(skillBreakdown[area]);
    });

    return {
      id: student.id,
      name: student.name,
      grade: student.grade,
      disability: student.disability,
      totalGoals: studentGoals.length,
      avgScore: calculateMean(scores),
      medianScore: calculateMedian(scores),
      trend: analyzeTrend(scores),
      skillAverages,
      dataPoints: scores.length
    };
  }).sort((a, b) => b.avgScore - a.avgScore);
}
