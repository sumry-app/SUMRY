import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle, TrendingUp, TrendingDown, CheckCircle, Target,
  Brain, Zap, Calendar, AlertCircle, Award, Sparkles, X,
  ChevronDown, ChevronUp, Info, Clock, BarChart3, Users,
  FileText, Activity
} from 'lucide-react';
import { generateInsights, generateInsightsSummary, getInsightStats } from '@/lib/aiInsights';

/**
 * AI-Powered Insights Panel
 * Displays intelligent analysis, predictions, and recommendations
 */
export default function InsightsPanel({ students, goals, logs, accommodations = [] }) {
  const [dismissedInsights, setDismissedInsights] = useState(new Set());
  const [expandedInsights, setExpandedInsights] = useState(new Set());
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Generate insights
  const allInsights = useMemo(
    () => generateInsights(students, goals, logs, accommodations),
    [students, goals, logs, accommodations]
  );

  // Filter insights
  const insights = useMemo(() => {
    return allInsights.filter(insight => {
      if (dismissedInsights.has(insight.id)) return false;
      if (filterPriority !== 'all' && insight.priority !== filterPriority) return false;
      if (filterType !== 'all' && insight.type !== filterType) return false;
      return true;
    });
  }, [allInsights, dismissedInsights, filterPriority, filterType]);

  const summary = useMemo(() => generateInsightsSummary(allInsights), [allInsights]);
  const stats = useMemo(() => getInsightStats(allInsights), [allInsights]);

  const handleDismiss = (insightId) => {
    setDismissedInsights(prev => new Set([...prev, insightId]));
  };

  const toggleExpand = (insightId) => {
    setExpandedInsights(prev => {
      const newSet = new Set(prev);
      if (newSet.has(insightId)) {
        newSet.delete(insightId);
      } else {
        newSet.add(insightId);
      }
      return newSet;
    });
  };

  if (students.length === 0 || goals.length === 0) {
    return (
      <Card className="border-2 border-purple-200">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Brain className="w-12 h-12 mx-auto text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">AI Insights Engine Ready</h3>
            <p className="text-gray-600">
              Add students and goals to receive intelligent analysis and recommendations.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Summary */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <CardTitle>AI Insights Engine</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-700">{summary}</p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              label="Total Insights"
              value={stats.total}
              icon={Brain}
              color="purple"
            />
            <StatCard
              label="High Priority"
              value={stats.highPriority}
              icon={AlertTriangle}
              color="red"
            />
            <StatCard
              label="Actionable"
              value={stats.actionable}
              icon={Zap}
              color="blue"
            />
            <StatCard
              label="Success Patterns"
              value={stats.byType.pattern + stats.byType.success}
              icon={Award}
              color="green"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <span className="text-sm font-medium text-gray-600 self-center mr-2">Filter:</span>
            <FilterButton
              active={filterPriority === 'all'}
              onClick={() => setFilterPriority('all')}
            >
              All
            </FilterButton>
            <FilterButton
              active={filterPriority === 'high'}
              onClick={() => setFilterPriority('high')}
              variant="red"
            >
              High Priority
            </FilterButton>
            <FilterButton
              active={filterPriority === 'medium'}
              onClick={() => setFilterPriority('medium')}
              variant="yellow"
            >
              Medium
            </FilterButton>
            <FilterButton
              active={filterPriority === 'low'}
              onClick={() => setFilterPriority('low')}
              variant="green"
            >
              Low
            </FilterButton>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-600 self-center mr-2">Type:</span>
            <FilterButton
              active={filterType === 'all'}
              onClick={() => setFilterType('all')}
            >
              All Types
            </FilterButton>
            <FilterButton
              active={filterType === 'risk'}
              onClick={() => setFilterType('risk')}
            >
              At Risk
            </FilterButton>
            <FilterButton
              active={filterType === 'prediction'}
              onClick={() => setFilterType('prediction')}
            >
              Predictions
            </FilterButton>
            <FilterButton
              active={filterType === 'success'}
              onClick={() => setFilterType('success')}
            >
              Successes
            </FilterButton>
          </div>
        </CardContent>
      </Card>

      {/* Insights List */}
      <div className="space-y-3">
        {insights.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-4">
                <Info className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">No insights match your current filters.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          insights.map(insight => (
            <InsightCard
              key={insight.id}
              insight={insight}
              expanded={expandedInsights.has(insight.id)}
              onToggleExpand={() => toggleExpand(insight.id)}
              onDismiss={() => handleDismiss(insight.id)}
            />
          ))
        )}
      </div>

      {/* Dismissed Insights */}
      {dismissedInsights.size > 0 && (
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissedInsights(new Set())}
            className="text-gray-500"
          >
            Show {dismissedInsights.size} dismissed insight{dismissedInsights.size !== 1 ? 's' : ''}
          </Button>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  const colorClasses = {
    purple: 'text-purple-600 bg-purple-100',
    red: 'text-red-600 bg-red-100',
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100'
  };

  return (
    <div className="bg-white rounded-lg p-3 border">
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded ${colorClasses[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-gray-600">{label}</p>
        </div>
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, variant, children }) {
  const baseClass = "px-3 py-1 text-xs rounded-full transition-colors";
  const variantClasses = {
    red: active ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700 hover:bg-red-200',
    yellow: active ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
    green: active ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200',
  };

  const className = variant
    ? `${baseClass} ${variantClasses[variant]}`
    : active
      ? `${baseClass} bg-purple-500 text-white`
      : `${baseClass} bg-gray-100 text-gray-700 hover:bg-gray-200`;

  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
}

function InsightCard({ insight, expanded, onToggleExpand, onDismiss }) {
  const {
    type,
    priority,
    student,
    goal,
    title,
    message,
    confidence,
    actionable,
    recommendations,
    indicators,
    timestamp
  } = insight;

  const priorityConfig = {
    high: {
      borderColor: 'border-red-300',
      bgColor: 'bg-red-50',
      badgeVariant: 'destructive',
      icon: AlertTriangle
    },
    medium: {
      borderColor: 'border-yellow-300',
      bgColor: 'bg-yellow-50',
      badgeVariant: 'default',
      icon: AlertCircle
    },
    low: {
      borderColor: 'border-green-300',
      bgColor: 'bg-green-50',
      badgeVariant: 'secondary',
      icon: CheckCircle
    }
  };

  const typeConfig = {
    risk: { icon: AlertTriangle, label: 'Risk Alert', color: 'text-red-600' },
    prediction: { icon: Brain, label: 'Prediction', color: 'text-purple-600' },
    success: { icon: Award, label: 'Success', color: 'text-green-600' },
    anomaly: { icon: Activity, label: 'Anomaly', color: 'text-orange-600' },
    accommodation: { icon: Target, label: 'Accommodation', color: 'text-blue-600' },
    gap: { icon: Calendar, label: 'Data Gap', color: 'text-gray-600' },
    baseline: { icon: BarChart3, label: 'Baseline', color: 'text-indigo-600' },
    pattern: { icon: Sparkles, label: 'Pattern', color: 'text-pink-600' },
    'iep-review': { icon: FileText, label: 'IEP Review', color: 'text-red-600' }
  };

  const config = priorityConfig[priority];
  const typeInfo = typeConfig[type] || { icon: Info, label: 'Info', color: 'text-gray-600' };
  const PriorityIcon = config.icon;
  const TypeIcon = typeInfo.icon;

  return (
    <Card className={`border-l-4 ${config.borderColor} hover:shadow-md transition-shadow`}>
      <CardContent className="pt-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${config.bgColor} flex-shrink-0`}>
              <PriorityIcon className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-sm leading-tight">{title}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDismiss}
                  className="h-6 w-6 p-0 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant={config.badgeVariant} className="text-xs">
                  {priority.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <TypeIcon className="w-3 h-3 mr-1" />
                  {typeInfo.label}
                </Badge>
                {confidence && (
                  <Badge variant="outline" className="text-xs">
                    {confidence}% confidence
                  </Badge>
                )}
                {student && (
                  <Badge variant="outline" className="text-xs">
                    <Users className="w-3 h-3 mr-1" />
                    {student.name}
                  </Badge>
                )}
              </div>

              <p className="text-sm text-gray-700 leading-relaxed">{message}</p>

              {/* Indicators */}
              {indicators && indicators.length > 0 && (
                <div className="mt-2 space-y-1">
                  {indicators.map((indicator, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                      <TrendingDown className="w-3 h-3 mt-0.5 flex-shrink-0 text-red-500" />
                      <span>{indicator}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Expandable Recommendations */}
              {actionable && recommendations && recommendations.length > 0 && (
                <div className="mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleExpand}
                    className="h-auto p-0 text-purple-600 hover:text-purple-700 font-medium"
                  >
                    {expanded ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-1" />
                        Hide Recommendations
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-1" />
                        View {recommendations.length} Recommendation{recommendations.length !== 1 ? 's' : ''}
                      </>
                    )}
                  </Button>

                  {expanded && (
                    <div className="mt-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-semibold text-purple-900">
                          Recommended Actions
                        </span>
                      </div>
                      <ul className="space-y-1.5">
                        {recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                            <span className="text-purple-600 font-bold mt-0.5">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Why Explanation */}
              {expanded && insight.anomalies && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-900">Why This Matters</span>
                  </div>
                  <p className="text-xs text-gray-700">
                    Anomaly detection uses statistical analysis to identify unusual patterns.
                    This helps catch issues early before they become major problems.
                  </p>
                  {insight.anomalies.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {insight.anomalies.map((anomaly, idx) => (
                        <div key={idx} className="text-xs text-gray-600">
                          {anomaly.date}: {anomaly.score} ({anomaly.type === 'spike' ? '↑' : '↓'})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {expanded && insight.effectiveness && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-900">Analysis Details</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-600">Average Score:</span>
                      <span className="ml-1 font-semibold">{insight.effectiveness.avgScore}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Usage Count:</span>
                      <span className="ml-1 font-semibold">{insight.effectiveness.usageCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Effectiveness:</span>
                      <span className="ml-1 font-semibold">{insight.effectiveness.effectiveness}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Impact:</span>
                      <span className="ml-1 font-semibold capitalize">{insight.effectiveness.impact}</span>
                    </div>
                  </div>
                </div>
              )}

              {expanded && insight.daysRemaining && (
                <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-semibold text-green-900">Timeline Forecast</span>
                  </div>
                  <p className="text-xs text-gray-700">
                    Based on current progress rate, goal completion is estimated in{' '}
                    <span className="font-semibold">{insight.daysRemaining} days</span>.
                    This prediction is based on linear regression analysis of historical data.
                  </p>
                </div>
              )}

              {/* Timestamp */}
              <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>Generated {new Date(timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
