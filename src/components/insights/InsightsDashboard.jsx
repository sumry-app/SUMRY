import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, BarChart3, Users, Download, RefreshCw } from 'lucide-react';
import InsightsPanel from './InsightsPanel';
import { loadStore } from '@/lib/data';
import { generateInsights, getInsightStats } from '@/lib/aiInsights';

/**
 * Complete Insights Dashboard - Main integration example
 * Shows how to use the AI Insights Engine in your app
 */
export default function InsightsDashboard() {
  const [store, setStore] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const data = loadStore();
    setStore(data);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      loadData();
      setIsRefreshing(false);
    }, 500);
  };

  const handleExportInsights = () => {
    if (!store) return;

    const insights = generateInsights(
      store.students || [],
      store.goals || [],
      store.logs || [],
      store.accommodations || []
    );

    const exportData = {
      generatedAt: new Date().toISOString(),
      summary: getInsightStats(insights),
      insights: insights.map(i => ({
        type: i.type,
        priority: i.priority,
        title: i.title,
        message: i.message,
        confidence: i.confidence,
        student: i.student?.name,
        actionable: i.actionable,
        recommendations: i.recommendations
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sumry-insights-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!store) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Brain className="w-12 h-12 mx-auto text-purple-400 mb-4 animate-pulse" />
          <p className="text-gray-600">Loading insights engine...</p>
        </div>
      </div>
    );
  }

  const students = store.students || [];
  const goals = store.goals || [];
  const logs = store.logs || [];
  const accommodations = store.accommodations || [];

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Brain className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Insights Dashboard</h1>
              <p className="text-gray-600">
                Intelligent analysis powered by machine learning algorithms
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportInsights}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList>
          <TabsTrigger value="insights">
            <Brain className="w-4 h-4 mr-2" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="students">
            <Users className="w-4 h-4 mr-2" />
            By Student
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          <InsightsPanel
            students={students}
            goals={goals}
            logs={logs}
            accommodations={accommodations}
          />
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <OverviewStats
            students={students}
            goals={goals}
            logs={logs}
          />
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <StudentBreakdown
            students={students}
            goals={goals}
            logs={logs}
            accommodations={accommodations}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OverviewStats({ students, goals, logs }) {
  const insights = generateInsights(students, goals, logs);
  const stats = getInsightStats(insights);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Insight Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(stats.byType).map(([type, count]) => (
              count > 0 && (
                <div key={type} className="flex justify-between text-sm">
                  <span className="text-gray-600 capitalize">{type.replace('-', ' ')}:</span>
                  <span className="font-semibold">{count}</span>
                </div>
              )
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Priority Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-red-600 font-medium">High Priority:</span>
              <span className="font-semibold">{stats.highPriority}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-yellow-600 font-medium">Medium Priority:</span>
              <span className="font-semibold">{stats.mediumPriority}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-600 font-medium">Low Priority:</span>
              <span className="font-semibold">{stats.lowPriority}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Students:</span>
              <span className="font-semibold">{students.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Goals:</span>
              <span className="font-semibold">{goals.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Data Points:</span>
              <span className="font-semibold">{logs.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Actionable Items:</span>
              <span className="font-semibold">{stats.actionable}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StudentBreakdown({ students, goals, logs, accommodations }) {
  return (
    <div className="space-y-4">
      {students.map(student => {
        const studentGoals = goals.filter(g => g.studentId === student.id);
        const studentLogs = logs.filter(l =>
          studentGoals.some(g => g.id === l.goalId)
        );

        const insights = generateInsights(
          [student],
          studentGoals,
          studentLogs,
          accommodations
        );

        return (
          <Card key={student.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{student.name}</span>
                <div className="flex gap-2">
                  <span className="text-sm font-normal text-gray-600">
                    {studentGoals.length} goals
                  </span>
                  <span className="text-sm font-normal text-gray-600">
                    {studentLogs.length} data points
                  </span>
                  <span className="text-sm font-normal text-purple-600">
                    {insights.length} insights
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {insights.length > 0 ? (
                <div className="space-y-2">
                  {insights.slice(0, 3).map(insight => (
                    <div
                      key={insight.id}
                      className="p-3 bg-gray-50 rounded border-l-4 border-purple-400"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm">{insight.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{insight.message}</p>
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {insight.confidence}%
                        </span>
                      </div>
                    </div>
                  ))}
                  {insights.length > 3 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{insights.length - 3} more insights
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Add more progress data to generate insights for this student.
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
