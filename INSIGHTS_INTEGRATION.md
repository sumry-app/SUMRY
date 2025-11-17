# AI Insights Engine - Integration Guide

## Quick Start

The AI Insights Engine is now ready to use in your SUMRY application. Here's how to integrate it:

## 1. Basic Integration (Simplest)

Add the InsightsPanel component to any page:

```jsx
import InsightsPanel from '@/components/insights/InsightsPanel';
import { loadStore } from '@/lib/data';

function MyPage() {
  const store = loadStore();

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

## 2. Full Dashboard Integration

Use the complete InsightsDashboard component:

```jsx
import InsightsDashboard from '@/components/insights/InsightsDashboard';

function InsightsPage() {
  return <InsightsDashboard />;
}
```

## 3. Custom Integration

Use the core engine directly for custom displays:

```jsx
import { generateInsights, getInsightStats } from '@/lib/aiInsights';
import { loadStore } from '@/lib/data';

function CustomInsights() {
  const store = loadStore();
  const insights = generateInsights(
    store.students,
    store.goals,
    store.logs
  );

  // Filter for high priority only
  const highPriority = insights.filter(i => i.priority === 'high');

  // Get statistics
  const stats = getInsightStats(insights);

  return (
    <div>
      <h2>High Priority Alerts: {highPriority.length}</h2>
      {highPriority.map(insight => (
        <div key={insight.id}>
          <h3>{insight.title}</h3>
          <p>{insight.message}</p>
        </div>
      ))}
    </div>
  );
}
```

## 4. Add to Navigation

Add insights to your app's navigation:

```jsx
import { Link } from 'react-router-dom';
import { Brain } from 'lucide-react';

<nav>
  <Link to="/insights">
    <Brain className="w-5 h-5" />
    AI Insights
  </Link>
</nav>
```

## 5. Add Route

In your router configuration:

```jsx
import InsightsDashboard from '@/components/insights/InsightsDashboard';

<Route path="/insights" element={<InsightsDashboard />} />
```

## Features Available

### Insight Types
- ✅ **Risk Alerts**: Students falling behind
- ✅ **Success Predictions**: Goal completion forecasts
- ✅ **Anomaly Detection**: Unusual data points
- ✅ **Accommodation Analysis**: Effectiveness measurement
- ✅ **Data Gap Alerts**: Missing progress data
- ✅ **Baseline Recommendations**: Goal adjustment suggestions
- ✅ **Success Patterns**: Replicable strategies
- ✅ **IEP Review Triggers**: When team meetings are needed

### UI Features
- ✅ Priority filtering (High/Medium/Low)
- ✅ Type filtering (Risk/Success/Prediction/etc.)
- ✅ Expandable recommendations
- ✅ Dismissible insights
- ✅ Confidence scores
- ✅ Natural language summaries
- ✅ Export functionality

## Example: Dashboard Widget

Create a small insights widget for your main dashboard:

```jsx
import { generateInsights } from '@/lib/aiInsights';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

function InsightsWidget({ students, goals, logs }) {
  const insights = generateInsights(students, goals, logs);
  const highPriority = insights.filter(i => i.priority === 'high');

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-bold mb-3 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5" />
        AI Insights
      </h3>

      {highPriority.length === 0 ? (
        <p className="text-sm text-gray-600">
          No high-priority alerts
        </p>
      ) : (
        <div className="space-y-2">
          {highPriority.slice(0, 3).map(insight => (
            <div key={insight.id} className="text-sm">
              <Badge variant="destructive" className="mb-1">
                HIGH PRIORITY
              </Badge>
              <p className="font-medium">{insight.title}</p>
            </div>
          ))}
          {highPriority.length > 3 && (
            <Link to="/insights" className="text-sm text-blue-600">
              +{highPriority.length - 3} more alerts
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
```

## Example: Email/Notification Summary

Generate a summary for notifications:

```jsx
import { generateInsights, generateInsightsSummary } from '@/lib/aiInsights';

function generateDailyDigest(store) {
  const insights = generateInsights(
    store.students,
    store.goals,
    store.logs
  );

  const summary = generateInsightsSummary(insights);
  const highPriority = insights.filter(i => i.priority === 'high');

  return {
    subject: `SUMRY Daily Digest - ${highPriority.length} High Priority Items`,
    body: `
      ${summary}

      High Priority Items:
      ${highPriority.map(i => `• ${i.title}`).join('\n')}

      View full insights at: /insights
    `
  };
}
```

## Performance Tips

1. **Memoize Results**: Use `useMemo` to avoid recalculation
```jsx
const insights = useMemo(
  () => generateInsights(students, goals, logs),
  [students, goals, logs]
);
```

2. **Filter Early**: Filter data before generating insights if you only need specific students
```jsx
const activeStudents = students.filter(s => s.isActive);
const insights = generateInsights(activeStudents, goals, logs);
```

3. **Lazy Load**: Load insights on demand rather than on page load
```jsx
const [insights, setInsights] = useState([]);
const [loading, setLoading] = useState(false);

const loadInsights = () => {
  setLoading(true);
  const result = generateInsights(students, goals, logs);
  setInsights(result);
  setLoading(false);
};
```

## Customization

### Adjust Risk Thresholds

Edit `/src/lib/aiInsights.js`:

```javascript
// Line ~100: Adjust risk score thresholds
const riskLevel = riskScore >= 60 ? 'high' :  // Changed from 50
                  riskScore >= 30 ? 'medium' : // Changed from 25
                  'low';
```

### Change Anomaly Sensitivity

```javascript
// Line ~50: Adjust standard deviation threshold
const threshold = 1.5; // More sensitive (default: 2)
// or
const threshold = 3; // Less sensitive
```

### Add Custom Insight Type

```javascript
// In generateInsights() function, add:
if (myCustomCondition) {
  insights.push({
    id: `custom-${student.id}`,
    type: 'custom-type',
    priority: 'medium',
    student,
    title: 'Custom Insight',
    message: 'Your custom message',
    confidence: 75,
    actionable: true,
    recommendations: ['Action 1', 'Action 2']
  });
}
```

## Testing

Run the comprehensive test suite:

```bash
npm test -- aiInsights.test.js
```

All 20 tests covering:
- Risk identification
- Success predictions
- Anomaly detection
- Accommodation effectiveness
- Baseline recommendations
- Success patterns
- IEP review triggers
- Statistical calculations

## API Reference

See `/src/components/insights/README.md` for complete API documentation.

## Support

The AI Insights Engine is:
- ✅ **100% Client-Side**: No API required
- ✅ **Privacy-First**: All data stays on device
- ✅ **Offline-Ready**: Works without internet
- ✅ **Fast**: Processes hundreds of data points in milliseconds
- ✅ **Well-Tested**: 20 comprehensive tests
- ✅ **Documented**: Full documentation and examples

For questions or issues, refer to the README in `/src/components/insights/`.
