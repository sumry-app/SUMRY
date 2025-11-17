# AI-Powered Insights Engine for SUMRY

## Overview

The AI Insights Engine provides intelligent analysis of student progress data, offering predictions, risk identification, and actionable recommendations - all running client-side with no API required.

## Components

### 1. **aiInsights.js** - Core Intelligence Library

Location: `/src/lib/aiInsights.js`

The heart of the system, providing:

#### Analysis Capabilities

- **Pattern Detection**: Identifies success patterns across students
- **Risk Identification**: Detects students falling behind with specific risk factors
- **Success Prediction**: Forecasts goal completion dates based on trajectory
- **Anomaly Detection**: Finds unusual spikes or drops in progress data
- **Accommodation Analysis**: Measures effectiveness of different accommodations
- **Baseline Analysis**: Recommends when baselines need adjustment
- **Data Gap Detection**: Identifies missing data collection periods
- **IEP Review Recommendations**: Suggests when team meetings are needed

#### Key Functions

```javascript
import { generateInsights, generateInsightsSummary, getInsightStats } from '@/lib/aiInsights';

// Generate all insights
const insights = generateInsights(students, goals, logs, accommodations);

// Get natural language summary
const summary = generateInsightsSummary(insights);

// Get statistics
const stats = getInsightStats(insights);
```

#### Statistical Methods Used

- **Linear Regression**: Trendline calculation and prediction
- **Standard Deviation**: Anomaly detection (2σ threshold)
- **Moving Average**: Trend smoothing
- **Correlation Analysis**: Accommodation effectiveness
- **Time Series Analysis**: Pattern detection

### 2. **InsightsPanel.jsx** - Main UI Component

Location: `/src/components/insights/InsightsPanel.jsx`

Interactive panel displaying insights with:

#### Features

- **Priority Filtering**: High, Medium, Low
- **Type Filtering**: Risk, Prediction, Success, Anomaly, etc.
- **Expandable Cards**: Show/hide recommendations
- **Dismissible Insights**: Remove insights you've acted on
- **Confidence Scores**: AI confidence level (0-100%)
- **Action Recommendations**: Specific next steps
- **Why Explanations**: Context for each insight
- **Trend Indicators**: Visual up/down arrows

#### Usage

```jsx
import InsightsPanel from '@/components/insights/InsightsPanel';

<InsightsPanel
  students={students}
  goals={goals}
  logs={logs}
  accommodations={accommodations}
/>
```

### 3. **InsightsDashboard.jsx** - Complete Example

Location: `/src/components/insights/InsightsDashboard.jsx`

Full-featured dashboard with:
- Multiple tabs (Insights, Overview, By Student)
- Export functionality
- Refresh capability
- Statistics overview

## Insight Types

### 1. Risk Alerts
**Type**: `risk`
**Priority**: High/Medium/Low based on risk score

Identifies students at risk with factors like:
- Declining progress trend
- Performance below baseline
- Data collection gaps (>14 days)
- Low percentage of goals on track

**Example**:
```
Title: "Sarah Johnson is at high risk"
Message: "Declining progress trend detected. Performance below baseline. Only 25% of goals on track"
Recommendations:
- Schedule IEP team meeting
- Increase data collection frequency
- Consider adjusting goals
```

### 2. Success Predictions
**Type**: `prediction`
**Priority**: Low/Medium

Forecasts goal completion based on current trajectory:
- Days until completion
- Confidence level
- Linear regression analysis

**Example**:
```
Title: "Mike Chen - Goal completion predicted soon"
Message: "Based on current trajectory, this goal is predicted to be achieved in approximately 23 days"
Confidence: 87%
```

### 3. Success Notifications
**Type**: `success`
**Priority**: Low

Celebrates when goals are achieved:
- Target met or exceeded
- Recommendations for next steps

### 4. Anomaly Detection
**Type**: `anomaly`
**Priority**: High (for drops), Medium (for spikes)

Identifies unusual data points:
- Statistical outliers (>2 standard deviations)
- Spikes or drops in performance
- Dates of anomalies

**Example**:
```
Title: "Unusual drop detected for Alex Martinez"
Message: "Data point on 2025-11-15 shows 2.3 standard deviations from average"
```

### 5. Accommodation Effectiveness
**Type**: `accommodation`
**Priority**: Low/Medium

Analyzes which accommodations work:
- Comparison with baseline
- Usage count
- Effectiveness percentage
- Impact rating (high/medium/low)

**Example**:
```
Title: "Accommodation 'Extended time' is highly effective"
Message: "Shows 28% improvement over baseline. Consider expanding use"
```

### 6. Data Collection Gaps
**Type**: `gap`
**Priority**: High (no data), Medium (>14 days)

Alerts about missing data:
- Days since last log
- No data at all for goals

### 7. Baseline Recommendations
**Type**: `baseline`
**Priority**: Medium/High

Suggests baseline adjustments:
- When student exceeds target significantly
- When student performs well below baseline

### 8. Success Patterns
**Type**: `pattern`
**Priority**: Low

Identifies replicable success patterns:
- Consistent improvement
- Accommodation success
- Rapid acceleration

### 9. IEP Review Needed
**Type**: `iep-review`
**Priority**: High

Recommends team meetings when:
- Multiple goals trending downward
- Recent performance declining
- Multiple concerning factors

## Integration Guide

### Basic Integration

```jsx
import { useState, useEffect } from 'react';
import InsightsPanel from '@/components/insights/InsightsPanel';
import { loadStore } from '@/lib/data';

function MyDashboard() {
  const [store, setStore] = useState(null);

  useEffect(() => {
    const data = loadStore();
    setStore(data);
  }, []);

  if (!store) return <div>Loading...</div>;

  return (
    <InsightsPanel
      students={store.students}
      goals={store.goals}
      logs={store.logs}
      accommodations={store.accommodations}
    />
  );
}
```

### Advanced Usage - Custom Filtering

```jsx
import { generateInsights } from '@/lib/aiInsights';

// Get only high-priority risk alerts
const insights = generateInsights(students, goals, logs);
const highRiskAlerts = insights.filter(i =>
  i.type === 'risk' && i.priority === 'high'
);

// Get insights for specific student
const studentInsights = insights.filter(i =>
  i.student?.id === studentId
);
```

### Export Insights

```jsx
const handleExport = () => {
  const insights = generateInsights(students, goals, logs);
  const exportData = {
    generatedAt: new Date().toISOString(),
    insights: insights.map(i => ({
      type: i.type,
      priority: i.priority,
      title: i.title,
      message: i.message,
      recommendations: i.recommendations
    }))
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json'
  });
  // ... download logic
};
```

## Configuration

### Thresholds

You can adjust these in `aiInsights.js`:

```javascript
// Anomaly detection sensitivity (standard deviations)
const threshold = 2; // Default: 2σ

// Data gap warning (days)
if (daysSinceLastLog > 14) // Default: 14 days

// Risk score calculation
riskScore >= 50 ? 'high' : // High risk threshold
riskScore >= 25 ? 'medium' : 'low' // Medium risk threshold
```

### Moving Average Window

```javascript
// Trend smoothing window size
const movingAvg = calculateMovingAverage(scores, 3); // Default: 3 data points
```

## Performance

All computations are client-side:
- **No API calls required**
- **Fast**: Processes hundreds of data points in milliseconds
- **Privacy**: All data stays on device
- **Offline**: Works without internet connection

Typical performance:
- 10 students, 30 goals, 200 logs: ~50ms
- 50 students, 150 goals, 1000 logs: ~200ms

## Data Requirements

### Minimum Data for Insights

| Insight Type | Minimum Logs | Notes |
|-------------|-------------|-------|
| Risk Detection | 3 per goal | Needs trend calculation |
| Predictions | 3 per goal | Linear regression |
| Anomalies | 5 per goal | Statistical analysis |
| Accommodations | 5 total | Need comparison data |
| Patterns | 5 per student | Cross-goal analysis |

### Data Quality Tips

1. **Consistent Collection**: Regular data points improve prediction accuracy
2. **Accurate Scores**: Use consistent scoring method
3. **Document Accommodations**: Tag logs with accommodations used
4. **Set Realistic Baselines**: Accurate baselines improve predictions

## Customization

### Add New Insight Types

```javascript
// In aiInsights.js, add to generateInsights()

// Example: Seasonal pattern detection
if (detectSeasonalPattern(goalLogs)) {
  insights.push({
    id: `seasonal-${goal.id}`,
    type: 'seasonal-pattern',
    priority: 'low',
    title: 'Seasonal pattern detected',
    message: 'Performance varies by time of year',
    confidence: 75,
    actionable: true,
    recommendations: ['Plan for seasonal variations']
  });
}
```

### Custom Styling

```jsx
// Modify InsightCard in InsightsPanel.jsx
const typeConfig = {
  // ... existing types
  'my-custom-type': {
    icon: MyIcon,
    label: 'Custom',
    color: 'text-custom-600'
  }
};
```

## Troubleshooting

### No Insights Generated

**Cause**: Insufficient data
**Solution**: Need at least 3-5 progress logs per goal

### Low Confidence Scores

**Cause**: Limited data history
**Solution**: Confidence increases with more data points

### Inaccurate Predictions

**Cause**: Irregular data collection
**Solution**: Collect data at consistent intervals

### Too Many Insights

**Cause**: Many students/goals
**Solution**: Use priority and type filters

## Future Enhancements

Potential additions:
- Machine learning model training
- Peer comparison (anonymized)
- Multi-goal correlation analysis
- Adaptive thresholds
- Custom insight rules
- Email notifications for high-priority insights

## API Reference

### generateInsights(students, goals, logs, accommodations)

Generates all insights.

**Parameters**:
- `students` (Array): Student objects
- `goals` (Array): Goal objects
- `logs` (Array): Progress log objects
- `accommodations` (Array): Accommodation objects (optional)

**Returns**: Array of insight objects

**Insight Object**:
```javascript
{
  id: string,
  type: string, // 'risk' | 'prediction' | 'success' | ...
  priority: string, // 'high' | 'medium' | 'low'
  student: object,
  goal: object,
  title: string,
  message: string,
  confidence: number, // 0-100
  actionable: boolean,
  recommendations: string[],
  timestamp: string
}
```

### generateInsightsSummary(insights)

Creates natural language summary.

**Returns**: String summary

### getInsightStats(insights)

Calculates statistics.

**Returns**:
```javascript
{
  total: number,
  highPriority: number,
  mediumPriority: number,
  lowPriority: number,
  actionable: number,
  byType: {
    risk: number,
    prediction: number,
    // ... etc
  }
}
```

## License

Part of the SUMRY project.
