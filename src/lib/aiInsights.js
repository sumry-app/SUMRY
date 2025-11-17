/**
 * AI-Powered Insights Engine for SUMRY
 * Provides intelligent analysis, predictions, and recommendations
 * All computations are client-side, no API required
 */

import { parseScore, calculateTrendline } from './data';

/**
 * Calculate standard deviation for anomaly detection
 */
function calculateStandardDeviation(values) {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Calculate moving average for trend smoothing
 */
function calculateMovingAverage(values, windowSize = 3) {
  if (values.length < windowSize) return values;
  const result = [];
  for (let i = 0; i <= values.length - windowSize; i++) {
    const window = values.slice(i, i + windowSize);
    const avg = window.reduce((a, b) => a + b, 0) / windowSize;
    result.push(avg);
  }
  return result;
}

/**
 * Calculate correlation coefficient between two arrays
 */
function calculateCorrelation(x, y) {
  if (x.length !== y.length || x.length < 2) return 0;

  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Predict goal completion date using regression
 */
function predictCompletionDate(logs, target, baseline) {
  if (logs.length < 3) return null;

  const sorted = [...logs].sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  const scores = sorted.map(log => parseScore(log.score)).filter(s => s !== null);

  if (scores.length < 3) return null;

  const trendline = calculateTrendline(sorted);
  if (!trendline || trendline.slope <= 0) return null;

  const targetNum = parseScore(target);
  const currentScore = scores[scores.length - 1];

  if (currentScore >= targetNum) {
    return { completed: true, daysRemaining: 0 };
  }

  const scoreGap = targetNum - currentScore;
  const daysPerPoint = 7 / trendline.slope; // Assuming weekly progress
  const daysRemaining = Math.ceil(scoreGap * daysPerPoint);

  return {
    completed: false,
    daysRemaining,
    confidence: Math.min(95, 60 + (scores.length * 5))
  };
}

/**
 * Detect anomalies in progress data
 */
function detectAnomalies(logs) {
  if (logs.length < 5) return [];

  const sorted = [...logs].sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  const scores = sorted.map(log => parseScore(log.score)).filter(s => s !== null);

  if (scores.length < 5) return [];

  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const stdDev = calculateStandardDeviation(scores);
  const threshold = 2; // 2 standard deviations

  const anomalies = [];
  scores.forEach((score, index) => {
    const zScore = Math.abs((score - mean) / stdDev);
    if (zScore > threshold) {
      anomalies.push({
        date: sorted[index].dateISO,
        score,
        deviation: zScore.toFixed(2),
        type: score > mean ? 'spike' : 'drop'
      });
    }
  });

  return anomalies;
}

/**
 * Analyze accommodation effectiveness
 */
function analyzeAccommodationEffectiveness(logs) {
  if (logs.length < 5) return [];

  const sorted = [...logs].sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  const accommodationMap = new Map();

  sorted.forEach(log => {
    const score = parseScore(log.score);
    if (score === null) return;

    const accommodations = log.accommodationsUsed || [];
    accommodations.forEach(acc => {
      if (!accommodationMap.has(acc)) {
        accommodationMap.set(acc, { scores: [], count: 0 });
      }
      accommodationMap.get(acc).scores.push(score);
      accommodationMap.get(acc).count++;
    });
  });

  // Calculate scores without accommodations
  const noAccommodationScores = sorted
    .filter(log => !log.accommodationsUsed || log.accommodationsUsed.length === 0)
    .map(log => parseScore(log.score))
    .filter(s => s !== null);

  const baselineAvg = noAccommodationScores.length > 0
    ? noAccommodationScores.reduce((a, b) => a + b, 0) / noAccommodationScores.length
    : null;

  const results = [];
  accommodationMap.forEach((data, accommodation) => {
    if (data.count < 2) return; // Need at least 2 instances

    const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
    const effectiveness = baselineAvg !== null
      ? ((avgScore - baselineAvg) / baselineAvg) * 100
      : 0;

    results.push({
      accommodation,
      avgScore: avgScore.toFixed(1),
      usageCount: data.count,
      effectiveness: effectiveness.toFixed(1),
      impact: effectiveness > 15 ? 'high' : effectiveness > 5 ? 'medium' : 'low'
    });
  });

  return results.sort((a, b) => parseFloat(b.effectiveness) - parseFloat(a.effectiveness));
}

/**
 * Identify students at risk
 */
function identifyAtRiskStudents(students, goals, logs) {
  const riskProfiles = students.map(student => {
    const studentGoals = goals.filter(g => g.studentId === student.id);
    if (studentGoals.length === 0) {
      return null;
    }

    const riskFactors = [];
    let riskScore = 0;

    // Factor 1: Declining progress
    studentGoals.forEach(goal => {
      const goalLogs = logs.filter(l => l.goalId === goal.id);
      if (goalLogs.length >= 3) {
        const sorted = [...goalLogs].sort((a, b) => a.dateISO.localeCompare(b.dateISO));
        const trendline = calculateTrendline(sorted);

        if (trendline && trendline.slope < -0.5) {
          riskFactors.push('Declining progress trend detected');
          riskScore += 25;
        }
      }
    });

    // Factor 2: Below baseline performance
    studentGoals.forEach(goal => {
      const goalLogs = logs.filter(l => l.goalId === goal.id);
      if (goalLogs.length >= 2) {
        const recentScores = goalLogs.slice(-3).map(l => parseScore(l.score)).filter(s => s !== null);
        const avgRecent = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
        const baseline = parseScore(goal.baseline);

        if (baseline !== null && avgRecent < baseline) {
          riskFactors.push('Performance below baseline');
          riskScore += 20;
        }
      }
    });

    // Factor 3: Data collection gaps
    const allStudentLogs = logs.filter(l =>
      studentGoals.some(g => g.id === l.goalId)
    );

    if (allStudentLogs.length > 0) {
      const sorted = [...allStudentLogs].sort((a, b) => a.dateISO.localeCompare(b.dateISO));
      const daysSinceLastLog = Math.floor(
        (new Date() - new Date(sorted[sorted.length - 1].dateISO)) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastLog > 14) {
        riskFactors.push(`No data collected in ${daysSinceLastLog} days`);
        riskScore += 15;
      }
    }

    // Factor 4: Low progress rate
    const onTrackGoals = studentGoals.filter(goal => {
      const goalLogs = logs.filter(l => l.goalId === goal.id);
      if (goalLogs.length < 3) return false;

      const recentScores = goalLogs.slice(-3).map(l => parseScore(l.score)).filter(s => s !== null);
      const avgRecent = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
      const target = parseScore(goal.target);
      const baseline = parseScore(goal.baseline);

      if (target === null || baseline === null) return false;

      const progress = ((avgRecent - baseline) / (target - baseline)) * 100;
      return progress >= 60;
    });

    const onTrackPercentage = (onTrackGoals.length / studentGoals.length) * 100;
    if (onTrackPercentage < 40) {
      riskFactors.push(`Only ${onTrackPercentage.toFixed(0)}% of goals on track`);
      riskScore += 30;
    }

    if (riskScore === 0) return null;

    return {
      student,
      riskScore: Math.min(100, riskScore),
      riskLevel: riskScore >= 50 ? 'high' : riskScore >= 25 ? 'medium' : 'low',
      riskFactors,
      goalsCount: studentGoals.length,
      onTrackCount: onTrackGoals.length
    };
  }).filter(Boolean);

  return riskProfiles.sort((a, b) => b.riskScore - a.riskScore);
}

/**
 * Detect success patterns across students
 */
function detectSuccessPatterns(students, goals, logs) {
  const patterns = [];

  students.forEach(student => {
    const studentGoals = goals.filter(g => g.studentId === student.id);
    const studentLogs = logs.filter(l => studentGoals.some(g => g.id === l.goalId));

    if (studentLogs.length < 5) return;

    // Pattern: Consistent improvement
    const sorted = [...studentLogs].sort((a, b) => a.dateISO.localeCompare(b.dateISO));
    const scores = sorted.map(l => parseScore(l.score)).filter(s => s !== null);

    if (scores.length >= 5) {
      const movingAvg = calculateMovingAverage(scores, 3);
      const isConsistentlyImproving = movingAvg.every((val, i) =>
        i === 0 || val >= movingAvg[i - 1] - 1
      );

      if (isConsistentlyImproving) {
        patterns.push({
          type: 'consistent_improvement',
          student,
          description: 'Consistent upward progress across all goals',
          confidence: 85
        });
      }
    }

    // Pattern: Accommodation success
    const accommodationScores = studentLogs.filter(l => l.accommodationsUsed?.length > 0);
    const noAccommodationScores = studentLogs.filter(l => !l.accommodationsUsed || l.accommodationsUsed.length === 0);

    if (accommodationScores.length >= 3 && noAccommodationScores.length >= 3) {
      const avgWith = accommodationScores
        .map(l => parseScore(l.score))
        .filter(s => s !== null)
        .reduce((a, b) => a + b, 0) / accommodationScores.length;

      const avgWithout = noAccommodationScores
        .map(l => parseScore(l.score))
        .filter(s => s !== null)
        .reduce((a, b) => a + b, 0) / noAccommodationScores.length;

      if (avgWith > avgWithout * 1.2) {
        patterns.push({
          type: 'accommodation_success',
          student,
          description: `Accommodations show ${((avgWith - avgWithout) / avgWithout * 100).toFixed(0)}% improvement`,
          confidence: 78
        });
      }
    }

    // Pattern: Rapid acceleration
    if (scores.length >= 6) {
      const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
      const secondHalf = scores.slice(Math.floor(scores.length / 2));

      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

      if (secondAvg > firstAvg * 1.3) {
        patterns.push({
          type: 'rapid_acceleration',
          student,
          description: 'Progress rate has significantly accelerated',
          confidence: 82
        });
      }
    }
  });

  return patterns;
}

/**
 * Generate comprehensive insights for all data
 */
export function generateInsights(students, goals, logs, accommodations = []) {
  const insights = [];

  // 1. Risk identification
  const atRiskStudents = identifyAtRiskStudents(students, goals, logs);
  atRiskStudents.forEach(risk => {
    insights.push({
      id: `risk-${risk.student.id}`,
      type: 'risk',
      priority: risk.riskLevel,
      student: risk.student,
      title: `${risk.student.name} is at ${risk.riskLevel} risk`,
      message: risk.riskFactors.join('. '),
      confidence: Math.min(95, 60 + (risk.riskFactors.length * 10)),
      indicators: risk.riskFactors,
      actionable: true,
      recommendations: [
        'Schedule IEP team meeting to review progress',
        'Increase frequency of data collection',
        'Consider adjusting goals or interventions',
        'Review and modify accommodation plan'
      ],
      timestamp: new Date().toISOString()
    });
  });

  // 2. Success predictions
  goals.forEach(goal => {
    const goalLogs = logs.filter(l => l.goalId === goal.id);
    if (goalLogs.length < 3) return;

    const prediction = predictCompletionDate(goalLogs, goal.target, goal.baseline);
    const student = students.find(s => s.id === goal.studentId);

    if (prediction && !prediction.completed) {
      const status = prediction.daysRemaining <= 30 ? 'success' :
                     prediction.daysRemaining <= 60 ? 'info' : 'warning';

      insights.push({
        id: `prediction-${goal.id}`,
        type: 'prediction',
        priority: status === 'success' ? 'low' : 'medium',
        student,
        goal,
        title: prediction.daysRemaining <= 30
          ? `${student?.name} - Goal completion predicted soon`
          : `${student?.name} - Goal progress on track`,
        message: `Based on current trajectory, this goal is predicted to be achieved in approximately ${prediction.daysRemaining} days.`,
        confidence: prediction.confidence,
        daysRemaining: prediction.daysRemaining,
        actionable: false,
        timestamp: new Date().toISOString()
      });
    } else if (prediction && prediction.completed) {
      insights.push({
        id: `completed-${goal.id}`,
        type: 'success',
        priority: 'low',
        student,
        goal,
        title: `${student?.name} has achieved goal target`,
        message: `Current performance meets or exceeds the target. Consider setting a new, more challenging goal.`,
        confidence: 95,
        actionable: true,
        recommendations: ['Update goal to new target', 'Celebrate success with student', 'Document strategy for replication'],
        timestamp: new Date().toISOString()
      });
    }
  });

  // 3. Anomaly detection
  goals.forEach(goal => {
    const goalLogs = logs.filter(l => l.goalId === goal.id);
    const anomalies = detectAnomalies(goalLogs);
    const student = students.find(s => s.id === goal.studentId);

    if (anomalies.length > 0) {
      const latestAnomaly = anomalies[anomalies.length - 1];
      insights.push({
        id: `anomaly-${goal.id}`,
        type: 'anomaly',
        priority: latestAnomaly.type === 'drop' ? 'high' : 'medium',
        student,
        goal,
        title: `Unusual ${latestAnomaly.type} detected for ${student?.name}`,
        message: `Data point on ${latestAnomaly.date} shows ${latestAnomaly.deviation} standard deviations from average. This warrants investigation.`,
        confidence: 88,
        anomalies,
        actionable: true,
        recommendations: [
          'Review circumstances on that date',
          'Check for environmental factors',
          'Verify data accuracy',
          'Consider if intervention change is needed'
        ],
        timestamp: new Date().toISOString()
      });
    }
  });

  // 4. Accommodation effectiveness
  goals.forEach(goal => {
    const goalLogs = logs.filter(l => l.goalId === goal.id);
    const effectiveness = analyzeAccommodationEffectiveness(goalLogs);
    const student = students.find(s => s.id === goal.studentId);

    if (effectiveness.length > 0) {
      const topAccommodation = effectiveness[0];
      if (topAccommodation.impact === 'high') {
        insights.push({
          id: `accommodation-${goal.id}`,
          type: 'accommodation',
          priority: 'low',
          student,
          goal,
          title: `Accommodation "${topAccommodation.accommodation}" is highly effective`,
          message: `Shows ${topAccommodation.effectiveness}% improvement over baseline. Consider expanding use.`,
          confidence: 82,
          effectiveness: topAccommodation,
          actionable: true,
          recommendations: [
            'Document successful accommodation strategy',
            'Apply similar accommodation to other goals',
            'Share success with IEP team'
          ],
          timestamp: new Date().toISOString()
        });
      } else if (topAccommodation.impact === 'low') {
        insights.push({
          id: `accommodation-low-${goal.id}`,
          type: 'accommodation',
          priority: 'medium',
          student,
          goal,
          title: `Accommodation "${topAccommodation.accommodation}" shows limited impact`,
          message: `Only ${topAccommodation.effectiveness}% improvement. Consider alternative accommodations.`,
          confidence: 75,
          effectiveness: topAccommodation,
          actionable: true,
          recommendations: [
            'Review accommodation implementation',
            'Try alternative accommodations',
            'Consult with IEP team'
          ],
          timestamp: new Date().toISOString()
        });
      }
    }
  });

  // 5. Data collection gaps
  students.forEach(student => {
    const studentGoals = goals.filter(g => g.studentId === student.id);
    const studentLogs = logs.filter(l =>
      studentGoals.some(g => g.id === l.goalId)
    );

    if (studentGoals.length > 0 && studentLogs.length > 0) {
      const sorted = [...studentLogs].sort((a, b) => b.dateISO.localeCompare(a.dateISO));
      const daysSinceLastLog = Math.floor(
        (new Date() - new Date(sorted[0].dateISO)) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastLog > 14) {
        insights.push({
          id: `gap-${student.id}`,
          type: 'gap',
          priority: daysSinceLastLog > 30 ? 'high' : 'medium',
          student,
          title: `Data collection gap for ${student.name}`,
          message: `No progress data recorded in ${daysSinceLastLog} days. Regular data collection is essential for tracking progress.`,
          confidence: 100,
          daysSinceLastLog,
          actionable: true,
          recommendations: [
            'Schedule data collection session',
            'Set up regular collection reminders',
            'Review data collection procedures'
          ],
          timestamp: new Date().toISOString()
        });
      }
    } else if (studentGoals.length > 0 && studentLogs.length === 0) {
      insights.push({
        id: `gap-nodata-${student.id}`,
        type: 'gap',
        priority: 'high',
        student,
        title: `No progress data for ${student.name}`,
        message: `Student has ${studentGoals.length} goal(s) but no progress data. Begin data collection immediately.`,
        confidence: 100,
        actionable: true,
        recommendations: [
          'Begin progress monitoring',
          'Establish baseline data',
          'Create data collection schedule'
        ],
        timestamp: new Date().toISOString()
      });
    }
  });

  // 6. Baseline adjustment recommendations
  goals.forEach(goal => {
    const goalLogs = logs.filter(l => l.goalId === goal.id);
    if (goalLogs.length < 5) return;

    const student = students.find(s => s.id === goal.studentId);
    const recentScores = goalLogs.slice(-5).map(l => parseScore(l.score)).filter(s => s !== null);
    const avgRecent = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    const baseline = parseScore(goal.baseline);
    const target = parseScore(goal.target);

    if (baseline !== null && target !== null) {
      if (avgRecent > target) {
        insights.push({
          id: `baseline-high-${goal.id}`,
          type: 'baseline',
          priority: 'medium',
          student,
          goal,
          title: `${student?.name} has exceeded goal target`,
          message: `Average recent performance (${avgRecent.toFixed(1)}) exceeds target (${target}). Consider raising the goal.`,
          confidence: 92,
          actionable: true,
          recommendations: [
            'Set new, more challenging target',
            'Celebrate achievement with student',
            'Document successful strategies'
          ],
          timestamp: new Date().toISOString()
        });
      } else if (avgRecent < baseline * 0.8) {
        insights.push({
          id: `baseline-low-${goal.id}`,
          type: 'baseline',
          priority: 'high',
          student,
          goal,
          title: `${student?.name} baseline may need adjustment`,
          message: `Recent performance (${avgRecent.toFixed(1)}) is below original baseline (${baseline}). Baseline may have been set too high.`,
          confidence: 85,
          actionable: true,
          recommendations: [
            'Re-assess current skill level',
            'Adjust baseline to reflect reality',
            'Review intervention strategies',
            'Schedule IEP team meeting'
          ],
          timestamp: new Date().toISOString()
        });
      }
    }
  });

  // 7. Success patterns
  const patterns = detectSuccessPatterns(students, goals, logs);
  patterns.forEach((pattern, index) => {
    insights.push({
      id: `pattern-${pattern.student.id}-${index}`,
      type: 'pattern',
      priority: 'low',
      student: pattern.student,
      title: `Success pattern identified for ${pattern.student.name}`,
      message: pattern.description,
      confidence: pattern.confidence,
      patternType: pattern.type,
      actionable: true,
      recommendations: [
        'Document successful approach',
        'Share strategy with team',
        'Apply pattern to other students'
      ],
      timestamp: new Date().toISOString()
    });
  });

  // 8. IEP review recommendations
  students.forEach(student => {
    const studentGoals = goals.filter(g => g.studentId === student.id);
    const studentLogs = logs.filter(l =>
      studentGoals.some(g => g.id === l.goalId)
    );

    if (studentGoals.length === 0) return;

    // Check if student has multiple concerning factors
    const concerningFactors = [];

    // Factor: Multiple off-track goals
    const offTrackGoals = studentGoals.filter(goal => {
      const goalLogs = logs.filter(l => l.goalId === goal.id);
      if (goalLogs.length < 3) return false;

      const sorted = [...goalLogs].sort((a, b) => a.dateISO.localeCompare(b.dateISO));
      const trendline = calculateTrendline(sorted);
      return trendline && trendline.slope < 0;
    });

    if (offTrackGoals.length >= studentGoals.length * 0.5) {
      concerningFactors.push(`${offTrackGoals.length} of ${studentGoals.length} goals trending downward`);
    }

    // Factor: Low recent performance
    if (studentLogs.length >= 5) {
      const recentLogs = studentLogs.slice(-5);
      const recentScores = recentLogs.map(l => parseScore(l.score)).filter(s => s !== null);
      const avgRecent = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;

      const allScores = studentLogs.map(l => parseScore(l.score)).filter(s => s !== null);
      const overallAvg = allScores.reduce((a, b) => a + b, 0) / allScores.length;

      if (avgRecent < overallAvg * 0.8) {
        concerningFactors.push('Recent performance declining');
      }
    }

    if (concerningFactors.length >= 2) {
      insights.push({
        id: `iep-review-${student.id}`,
        type: 'iep-review',
        priority: 'high',
        student,
        title: `IEP review recommended for ${student.name}`,
        message: `Multiple concerning factors detected: ${concerningFactors.join('; ')}. Team meeting recommended.`,
        confidence: 88,
        concerningFactors,
        actionable: true,
        recommendations: [
          'Schedule IEP team meeting',
          'Review current goals and services',
          'Assess need for additional supports',
          'Consider evaluation for new areas'
          ],
        timestamp: new Date().toISOString()
      });
    }
  });

  // Sort insights by priority (high > medium > low)
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  insights.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.confidence - a.confidence;
  });

  return insights;
}

/**
 * Generate natural language summary of insights
 */
export function generateInsightsSummary(insights) {
  if (insights.length === 0) {
    return "No insights available yet. Add more progress data to receive AI-powered analysis.";
  }

  const highPriority = insights.filter(i => i.priority === 'high').length;
  const atRisk = insights.filter(i => i.type === 'risk').length;
  const successes = insights.filter(i => i.type === 'success').length;
  const patterns = insights.filter(i => i.type === 'pattern').length;

  let summary = `Analysis complete: ${insights.length} insights generated. `;

  if (highPriority > 0) {
    summary += `${highPriority} high-priority items require immediate attention. `;
  }

  if (atRisk > 0) {
    summary += `${atRisk} student(s) identified as at-risk. `;
  }

  if (successes > 0) {
    summary += `${successes} goal(s) achieved or on track for completion. `;
  }

  if (patterns > 0) {
    summary += `${patterns} success pattern(s) detected that can be replicated. `;
  }

  return summary.trim();
}

/**
 * Get insight statistics for dashboard
 */
export function getInsightStats(insights) {
  return {
    total: insights.length,
    highPriority: insights.filter(i => i.priority === 'high').length,
    mediumPriority: insights.filter(i => i.priority === 'medium').length,
    lowPriority: insights.filter(i => i.priority === 'low').length,
    actionable: insights.filter(i => i.actionable).length,
    byType: {
      risk: insights.filter(i => i.type === 'risk').length,
      prediction: insights.filter(i => i.type === 'prediction').length,
      success: insights.filter(i => i.type === 'success').length,
      anomaly: insights.filter(i => i.type === 'anomaly').length,
      accommodation: insights.filter(i => i.type === 'accommodation').length,
      gap: insights.filter(i => i.type === 'gap').length,
      baseline: insights.filter(i => i.type === 'baseline').length,
      pattern: insights.filter(i => i.type === 'pattern').length,
      iepReview: insights.filter(i => i.type === 'iep-review').length
    }
  };
}
