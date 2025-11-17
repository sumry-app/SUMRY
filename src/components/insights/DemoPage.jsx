import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Code, Eye, FileJson } from 'lucide-react';
import InsightsPanel from './InsightsPanel';
import { loadDemoData } from '@/lib/demoInsightsData';
import { generateInsights, generateInsightsSummary, getInsightStats } from '@/lib/aiInsights';

/**
 * Demo Page for AI Insights Engine
 * Shows the engine in action with sample data
 */
export default function InsightsDemoPage() {
  const [showCode, setShowCode] = useState(false);
  const demoData = loadDemoData();

  const insights = generateInsights(
    demoData.students,
    demoData.goals,
    demoData.logs,
    demoData.accommodations
  );

  const summary = generateInsightsSummary(insights);
  const stats = getInsightStats(insights);

  const handleExportData = () => {
    const blob = new Blob([JSON.stringify(demoData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'demo-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportInsights = () => {
    const blob = new Blob([JSON.stringify(insights, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'demo-insights.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-3xl font-bold">AI Insights Engine Demo</h1>
          </div>
          <p className="text-purple-100 max-w-3xl">
            Experience the power of AI-driven student progress analysis. This demo uses
            realistic sample data to showcase all insight types: risk alerts, success predictions,
            anomaly detection, accommodation analysis, and more.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Students" value={demoData.students.length} />
          <StatCard label="Goals" value={demoData.goals.length} />
          <StatCard label="Data Points" value={demoData.logs.length} />
          <StatCard label="Insights Generated" value={insights.length} color="purple" />
        </div>

        {/* Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>AI Analysis Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{summary}</p>
            <div className="mt-4 flex gap-2">
              <Button onClick={handleExportData} variant="outline" size="sm">
                <FileJson className="w-4 h-4 mr-2" />
                Export Demo Data
              </Button>
              <Button onClick={handleExportInsights} variant="outline" size="sm">
                <FileJson className="w-4 h-4 mr-2" />
                Export Insights
              </Button>
              <Button
                onClick={() => setShowCode(!showCode)}
                variant="outline"
                size="sm"
              >
                <Code className="w-4 h-4 mr-2" />
                {showCode ? 'Hide' : 'Show'} Code
              </Button>
            </div>

            {showCode && (
              <div className="mt-4 bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-xs">
{`import { generateInsights } from '@/lib/aiInsights';
import { loadDemoData } from '@/lib/demoInsightsData';

const demoData = loadDemoData();
const insights = generateInsights(
  demoData.students,
  demoData.goals,
  demoData.logs,
  demoData.accommodations
);

// Result: ${insights.length} insights generated
// - ${stats.byType.risk} risk alerts
// - ${stats.byType.prediction} predictions
// - ${stats.byType.success} successes
// - ${stats.byType.anomaly} anomalies
// - ${stats.byType.accommodation} accommodation analyses
// - ${stats.byType.gap} data gaps`}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList>
          <TabsTrigger value="insights">
            <Eye className="w-4 h-4 mr-2" />
            Live Insights
          </TabsTrigger>
          <TabsTrigger value="data">
            <FileJson className="w-4 h-4 mr-2" />
            Sample Data
          </TabsTrigger>
          <TabsTrigger value="expected">
            <Sparkles className="w-4 h-4 mr-2" />
            Expected Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights">
          <InsightsPanel
            students={demoData.students}
            goals={demoData.goals}
            logs={demoData.logs}
            accommodations={demoData.accommodations}
          />
        </TabsContent>

        <TabsContent value="data">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Demo Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {demoData.students.map(student => (
                    <div key={student.id} className="border-l-4 border-purple-400 pl-4 py-2">
                      <h4 className="font-semibold">{student.name}</h4>
                      <p className="text-sm text-gray-600">
                        Grade: {student.grade} | Disability: {student.disability}
                      </p>
                      <p className="text-sm text-gray-600">
                        Goals: {demoData.goals.filter(g => g.studentId === student.id).length} |
                        Data Points: {demoData.logs.filter(l =>
                          demoData.goals.find(g => g.id === l.goalId && g.studentId === student.id)
                        ).length}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Characteristics</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span>
                      <strong>Emma Rodriguez:</strong> Shows declining progress across 2 goals
                      (triggers at-risk alert and IEP review recommendation)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>
                      <strong>Liam Chen:</strong> Consistent improvement with effective
                      accommodations (triggers success prediction and pattern detection)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>
                      <strong>Sophia Martinez:</strong> Already exceeded target with one anomaly
                      (triggers baseline recommendation and anomaly alert)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold">•</span>
                    <span>
                      <strong>Noah Johnson:</strong> No recent data collection
                      (triggers data gap alert)
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expected">
          <Card>
            <CardHeader>
              <CardTitle>Expected Insights from Demo Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ExpectedInsight
                  type="Risk Alert"
                  color="red"
                  description="Emma Rodriguez identified as at-risk due to declining progress on both goals and performance below baseline"
                />
                <ExpectedInsight
                  type="Success Prediction"
                  color="purple"
                  description="Liam Chen's behavior goal predicted to be achieved within 15-20 days based on current trajectory"
                />
                <ExpectedInsight
                  type="Goal Achieved"
                  color="green"
                  description="Sophia Martinez has exceeded her social skills goal target - recommend setting new, higher goal"
                />
                <ExpectedInsight
                  type="Anomaly Detection"
                  color="orange"
                  description="Unusual drop detected in Sophia Martinez's data (35 vs avg 87) - investigate circumstances"
                />
                <ExpectedInsight
                  type="Accommodation Effectiveness"
                  color="blue"
                  description="'Timer' and 'Break card' showing 25-40% improvement for Liam Chen - highly effective"
                />
                <ExpectedInsight
                  type="Data Collection Gap"
                  color="yellow"
                  description="Noah Johnson has no data collected in 35+ days - high priority alert"
                />
                <ExpectedInsight
                  type="Success Pattern"
                  color="pink"
                  description="Liam Chen shows consistent improvement pattern that can be replicated"
                />
                <ExpectedInsight
                  type="IEP Review Needed"
                  color="red"
                  description="Emma Rodriguez has multiple concerning factors - team meeting recommended"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ label, value, color = 'blue' }) {
  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50 text-blue-900',
    purple: 'border-purple-200 bg-purple-50 text-purple-900'
  };

  return (
    <Card className={`border-2 ${colorClasses[color]}`}>
      <CardContent className="pt-6">
        <p className="text-sm font-medium opacity-80">{label}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}

function ExpectedInsight({ type, color, description }) {
  const colorClasses = {
    red: 'border-red-300 bg-red-50',
    green: 'border-green-300 bg-green-50',
    blue: 'border-blue-300 bg-blue-50',
    yellow: 'border-yellow-300 bg-yellow-50',
    purple: 'border-purple-300 bg-purple-50',
    orange: 'border-orange-300 bg-orange-50',
    pink: 'border-pink-300 bg-pink-50'
  };

  return (
    <div className={`border-l-4 rounded p-4 ${colorClasses[color]}`}>
      <h4 className="font-semibold text-sm mb-1">{type}</h4>
      <p className="text-sm text-gray-700">{description}</p>
    </div>
  );
}
