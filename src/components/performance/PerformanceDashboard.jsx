import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Gauge,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  BarChart3,
  HardDrive,
  Network,
  Timer,
  Package,
  Sparkles
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  initializePerformanceMonitoring,
  stopPerformanceMonitoring,
  calculatePerformanceScore,
  getMetricsSummary,
  getPerformanceWarnings,
  exportPerformanceReport,
  exportToCSV,
  subscribe,
  getLocalStorageUsage,
  clearMetricsHistory,
  isProduction,
  getPerformanceBudgets
} from '@/lib/performanceMonitor';

/**
 * Performance Dashboard Component
 * Real-time monitoring and visualization of application performance metrics
 */
export default function PerformanceDashboard() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isDeveloperMode, setIsDeveloperMode] = useState(true);
  const [performanceScore, setPerformanceScore] = useState(null);
  const [metricsSummary, setMetricsSummary] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [metricsHistory, setMetricsHistory] = useState([]);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [selectedView, setSelectedView] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Initialize performance monitoring on mount
  useEffect(() => {
    if (isDeveloperMode) {
      initializePerformanceMonitoring();
      setIsMonitoring(true);
      updateMetrics();

      // Subscribe to performance updates
      const unsubscribe = subscribe((data) => {
        // Update metrics when new data comes in
        if (autoRefresh) {
          updateMetrics();
        }
      });

      return () => {
        unsubscribe();
        stopPerformanceMonitoring();
      };
    }
  }, [isDeveloperMode]);

  // Auto-refresh metrics
  useEffect(() => {
    if (!isMonitoring || !autoRefresh) return;

    const interval = setInterval(() => {
      updateMetrics();
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [isMonitoring, autoRefresh]);

  // Update all metrics
  const updateMetrics = useCallback(() => {
    const score = calculatePerformanceScore();
    const summary = getMetricsSummary();
    const currentWarnings = getPerformanceWarnings();

    setPerformanceScore(score);
    setMetricsSummary(summary);
    setWarnings(currentWarnings);

    // Add to history for charts
    setMetricsHistory(prev => {
      const newHistory = [
        ...prev,
        {
          timestamp: Date.now(),
          score,
          memory: summary?.memory?.current || 0,
          localStorage: summary?.localStorage?.mb || 0
        }
      ];

      // Keep only last 50 data points
      return newHistory.slice(-50);
    });

    setRefreshCounter(c => c + 1);
  }, []);

  // Manual refresh
  const handleRefresh = () => {
    updateMetrics();
  };

  // Toggle monitoring
  const handleToggleMonitoring = () => {
    if (isMonitoring) {
      stopPerformanceMonitoring();
      setIsMonitoring(false);
    } else {
      initializePerformanceMonitoring();
      setIsMonitoring(true);
      updateMetrics();
    }
  };

  // Export report
  const handleExportReport = () => {
    const report = exportPerformanceReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV
  const handleExportCSV = () => {
    exportToCSV();
  };

  // Clear history
  const handleClearHistory = () => {
    clearMetricsHistory();
    setMetricsHistory([]);
    updateMetrics();
  };

  // Get performance score color
  const getScoreColor = (score) => {
    if (score === null) return 'gray';
    if (score >= 90) return 'green';
    if (score >= 70) return 'yellow';
    if (score >= 50) return 'orange';
    return 'red';
  };

  // Get rating badge
  const getRatingBadge = (rating) => {
    const variants = {
      good: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Good' },
      'needs-improvement': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Needs Work' },
      poor: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Poor' },
      unknown: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Unknown' }
    };

    const variant = variants[rating] || variants.unknown;
    return (
      <Badge className={`${variant.color} border text-xs`}>
        {variant.label}
      </Badge>
    );
  };

  // Format metric value
  const formatMetricValue = (metric, value) => {
    if (value === null || value === undefined) return 'N/A';
    if (metric === 'CLS') return value.toFixed(3);
    if (typeof value === 'number') return Math.round(value);
    return value;
  };

  // Production mode check
  if (isProduction() && !isDeveloperMode) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <Gauge className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Performance Monitoring</h3>
        <p className="text-gray-500 text-center max-w-md mb-4">
          Performance monitoring is designed for development environments.
        </p>
        <Button onClick={() => setIsDeveloperMode(true)}>
          <Eye className="w-4 h-4 mr-2" />
          Enable Developer Mode
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
              <Gauge className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Performance Monitor</h2>
              <p className="text-gray-500 mt-1">
                Real-time application performance metrics and insights
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={isMonitoring ? 'default' : 'outline'}
            size="sm"
            onClick={handleToggleMonitoring}
          >
            {isMonitoring ? (
              <>
                <Activity className="w-4 h-4 mr-2 animate-pulse" />
                Monitoring
              </>
            ) : (
              <>
                <Activity className="w-4 h-4 mr-2" />
                Start Monitor
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={!isMonitoring}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>

          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Auto On' : 'Auto Off'}
          </Button>

          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportReport}
              className="h-8"
            >
              <Download className="w-4 h-4 mr-1" />
              JSON
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportCSV}
              className="h-8"
            >
              <Download className="w-4 h-4 mr-1" />
              CSV
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDeveloperMode(!isDeveloperMode)}
          >
            {isDeveloperMode ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Dev Mode
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Dev Mode
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Performance Score Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={refreshCounter}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Overall Performance Score
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Weighted average of all performance metrics
                  </p>
                </div>
                <div className="text-center">
                  <motion.div
                    key={performanceScore}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`text-6xl font-bold ${
                      getScoreColor(performanceScore) === 'green' ? 'text-green-600' :
                      getScoreColor(performanceScore) === 'yellow' ? 'text-yellow-600' :
                      getScoreColor(performanceScore) === 'orange' ? 'text-orange-600' :
                      getScoreColor(performanceScore) === 'red' ? 'text-red-600' :
                      'text-gray-400'
                    }`}
                  >
                    {performanceScore !== null ? performanceScore : '--'}
                  </motion.div>
                  <div className="text-sm text-gray-500 mt-1">out of 100</div>
                  {performanceScore !== null && (
                    <Badge className={`mt-2 ${
                      performanceScore >= 90 ? 'bg-green-100 text-green-800' :
                      performanceScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                      performanceScore >= 50 ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {performanceScore >= 90 ? 'Excellent' :
                       performanceScore >= 70 ? 'Good' :
                       performanceScore >= 50 ? 'Fair' :
                       'Needs Improvement'}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Performance Warnings */}
      {warnings.length > 0 && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-2 border-orange-200 bg-orange-50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <CardTitle className="text-orange-900">
                    Performance Warnings ({warnings.length})
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {warnings.slice(0, 5).map((warning, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border-2 ${
                        warning.severity === 'high'
                          ? 'bg-red-50 border-red-200'
                          : warning.severity === 'medium'
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {warning.severity === 'high' ? (
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                          ) : warning.severity === 'medium' ? (
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                          ) : (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-gray-900">
                              {warning.metric}
                            </span>
                            <Badge className="text-xs" variant="outline">
                              {warning.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{warning.message}</p>
                          <p className="text-xs text-gray-600 italic">
                            💡 {warning.suggestion}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Web Vitals Grid */}
      {metricsSummary?.webVitals && Object.keys(metricsSummary.webVitals).length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Core Web Vitals
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(metricsSummary.webVitals).map(([vital, data]) => (
              <WebVitalCard key={vital} vital={vital} data={data} />
            ))}
          </div>
        </div>
      )}

      {/* View Tabs */}
      <div className="flex gap-2 border-b">
        {['overview', 'memory', 'rendering', 'network', 'storage'].map((view) => (
          <button
            key={view}
            onClick={() => setSelectedView(view)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              selectedView === view
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {view}
          </button>
        ))}
      </div>

      {/* Dynamic Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {selectedView === 'overview' && (
            <OverviewView
              metricsSummary={metricsSummary}
              metricsHistory={metricsHistory}
              getRatingBadge={getRatingBadge}
            />
          )}

          {selectedView === 'memory' && (
            <MemoryView
              metricsSummary={metricsSummary}
              metricsHistory={metricsHistory}
            />
          )}

          {selectedView === 'rendering' && (
            <RenderingView metricsSummary={metricsSummary} />
          )}

          {selectedView === 'network' && (
            <NetworkView metricsSummary={metricsSummary} />
          )}

          {selectedView === 'storage' && (
            <StorageView
              metricsSummary={metricsSummary}
              handleClearHistory={handleClearHistory}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Web Vital Card Component
function WebVitalCard({ vital, data }) {
  const getRatingColor = (rating) => {
    if (rating === 'good') return 'from-green-500 to-green-600';
    if (rating === 'needs-improvement') return 'from-yellow-500 to-yellow-600';
    if (rating === 'poor') return 'from-red-500 to-red-600';
    return 'from-gray-500 to-gray-600';
  };

  const formatValue = (vital, value) => {
    if (vital === 'CLS') return value.toFixed(3);
    return `${Math.round(value)}ms`;
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-2 border-gray-100 hover:border-gray-200 transition-all">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${getRatingColor(data.rating)} mb-3`}>
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-sm font-semibold text-gray-600 mb-2">{vital}</h4>
            <motion.div
              key={data.current}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl font-bold text-gray-900"
            >
              {formatValue(vital, data.current)}
            </motion.div>
            <div className="mt-2">
              <Badge className={`text-xs ${
                data.rating === 'good' ? 'bg-green-100 text-green-800' :
                data.rating === 'needs-improvement' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {data.rating === 'good' ? 'Good' :
                 data.rating === 'needs-improvement' ? 'Fair' :
                 'Poor'}
              </Badge>
            </div>
            <div className="mt-3 pt-3 border-t text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Avg:</span>
                <span className="font-medium">{formatValue(vital, data.avg)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Overview View
function OverviewView({ metricsSummary, metricsHistory, getRatingBadge }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Performance History Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Performance Score History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {metricsHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={metricsHistory}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9333EA" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#9333EA" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                  stroke="#6B7280"
                  fontSize={12}
                />
                <YAxis domain={[0, 100]} stroke="#6B7280" fontSize={12} />
                <Tooltip
                  labelFormatter={(ts) => new Date(ts).toLocaleString()}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#9333EA"
                  strokeWidth={2}
                  fill="url(#scoreGradient)"
                  name="Performance Score"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">No data yet. Monitoring in progress...</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metricsSummary?.componentRenders && (
              <QuickStat
                icon={Timer}
                label="Avg Render Time"
                value={`${metricsSummary.componentRenders.avgTime.toFixed(2)}ms`}
                subtitle={`${metricsSummary.componentRenders.total} renders tracked`}
                color="blue"
              />
            )}
            {metricsSummary?.apiCalls && (
              <QuickStat
                icon={Network}
                label="API Success Rate"
                value={`${metricsSummary.apiCalls.successRate.toFixed(1)}%`}
                subtitle={`${metricsSummary.apiCalls.total} calls monitored`}
                color="green"
              />
            )}
            {metricsSummary?.memory && (
              <QuickStat
                icon={HardDrive}
                label="Memory Usage"
                value={`${metricsSummary.memory.current.toFixed(1)} MB`}
                subtitle={`${metricsSummary.memory.usagePercent.toFixed(1)}% of limit`}
                color="purple"
              />
            )}
            {metricsSummary?.localStorage && (
              <QuickStat
                icon={Database}
                label="LocalStorage"
                value={`${metricsSummary.localStorage.mb.toFixed(2)} MB`}
                subtitle={`${metricsSummary.localStorage.items} items stored`}
                color="orange"
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Quick Stat Component
function QuickStat({ icon: Icon, label, value, subtitle, color }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50">
      <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="text-sm text-gray-600">{label}</div>
        <div className="text-lg font-bold text-gray-900">{value}</div>
        {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
      </div>
    </div>
  );
}

// Memory View
function MemoryView({ metricsSummary, metricsHistory }) {
  if (!metricsSummary?.memory) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          <HardDrive className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          Memory monitoring not available in this browser.
        </CardContent>
      </Card>
    );
  }

  const { memory } = metricsSummary;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-purple-600" />
            Memory Usage Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          {metricsHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={metricsHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                  stroke="#6B7280"
                  fontSize={12}
                />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip
                  labelFormatter={(ts) => new Date(ts).toLocaleString()}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="memory"
                  stroke="#9333EA"
                  strokeWidth={2}
                  dot={false}
                  name="Memory (MB)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <p className="text-sm">No memory data yet...</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Memory Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Current Usage</span>
                <span className="text-sm font-bold text-purple-600">
                  {memory.current.toFixed(2)} MB
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all"
                  style={{ width: `${memory.usagePercent}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {memory.min.toFixed(1)}
                </div>
                <div className="text-xs text-blue-800">Min (MB)</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  {memory.avg.toFixed(1)}
                </div>
                <div className="text-xs text-purple-800">Avg (MB)</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-lg font-bold text-red-600">
                  {memory.max.toFixed(1)}
                </div>
                <div className="text-xs text-red-800">Max (MB)</div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Memory Limit</span>
                <span className="text-sm font-medium">{memory.limit.toFixed(0)} MB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Trend</span>
                <Badge className="capitalize">{memory.trend}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Rendering View
function RenderingView({ metricsSummary }) {
  if (!metricsSummary?.componentRenders) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          <Timer className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          No rendering data available yet.
        </CardContent>
      </Card>
    );
  }

  const { componentRenders } = metricsSummary;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-green-600" />
            Component Render Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {componentRenders.avgTime.toFixed(2)}
                </div>
                <div className="text-xs text-green-800 mt-1">Avg Time (ms)</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {componentRenders.total}
                </div>
                <div className="text-xs text-blue-800 mt-1">Total Renders</div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Min Time</span>
                <span className="text-sm font-medium">{componentRenders.minTime.toFixed(2)} ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Max Time</span>
                <span className="text-sm font-medium">{componentRenders.maxTime.toFixed(2)} ms</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Slowest Components</CardTitle>
        </CardHeader>
        <CardContent>
          {componentRenders.slowestComponents && componentRenders.slowestComponents.length > 0 ? (
            <div className="space-y-2">
              {componentRenders.slowestComponents.map((comp, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">{comp.name}</div>
                    <div className="text-xs text-gray-500">{comp.count} renders</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-orange-600">
                      {comp.avgTime.toFixed(2)} ms
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">No component data yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Network View
function NetworkView({ metricsSummary }) {
  if (!metricsSummary?.apiCalls && !metricsSummary?.network) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          <Network className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          No network data available yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {metricsSummary?.apiCalls && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="w-5 h-5 text-blue-600" />
              API Call Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {metricsSummary.apiCalls.successRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-green-800 mt-1">Success Rate</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {metricsSummary.apiCalls.avgDuration.toFixed(0)}
                  </div>
                  <div className="text-xs text-blue-800 mt-1">Avg Duration (ms)</div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Total Calls</span>
                  <span className="text-sm font-medium">{metricsSummary.apiCalls.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Max Duration</span>
                  <span className="text-sm font-medium">{metricsSummary.apiCalls.maxDuration.toFixed(0)} ms</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {metricsSummary?.apiCalls?.slowestEndpoints && (
        <Card>
          <CardHeader>
            <CardTitle>Slowest Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            {metricsSummary.apiCalls.slowestEndpoints.length > 0 ? (
              <div className="space-y-2">
                {metricsSummary.apiCalls.slowestEndpoints.map((endpoint, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 truncate">
                      <div className="font-medium text-sm text-gray-900 truncate">
                        {endpoint.endpoint}
                      </div>
                      <div className="text-xs text-gray-500">
                        {endpoint.count} calls
                        {endpoint.errors > 0 && (
                          <span className="text-red-600 ml-2">
                            {endpoint.errors} errors
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm font-bold text-orange-600">
                        {endpoint.avgDuration.toFixed(0)} ms
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">No endpoint data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Storage View
function StorageView({ metricsSummary, handleClearHistory }) {
  if (!metricsSummary?.localStorage) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          <Database className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          No storage data available.
        </CardContent>
      </Card>
    );
  }

  const { localStorage: storage } = metricsSummary;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-orange-600" />
            LocalStorage Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center p-6 bg-orange-50 rounded-lg">
              <div className="text-4xl font-bold text-orange-600">
                {storage.mb.toFixed(2)}
              </div>
              <div className="text-sm text-orange-800 mt-2">Megabytes Used</div>
              <div className="text-xs text-gray-600 mt-1">
                ({storage.kb.toFixed(2)} KB / {storage.bytes.toLocaleString()} bytes)
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Total Items</span>
                <span className="text-sm font-medium">{storage.items}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Rating</span>
                <Badge className={`${
                  storage.rating === 'good' ? 'bg-green-100 text-green-800' :
                  storage.rating === 'needs-improvement' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {storage.rating === 'good' ? 'Good' :
                   storage.rating === 'needs-improvement' ? 'Fair' :
                   'High'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Data Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Clear performance monitoring history to free up memory and start fresh tracking.
            </p>

            <Button
              variant="outline"
              onClick={handleClearHistory}
              className="w-full"
            >
              <Database className="w-4 h-4 mr-2" />
              Clear Performance History
            </Button>

            <div className="pt-4 border-t">
              <div className="space-y-2 text-sm text-gray-600">
                <p className="font-medium text-gray-900">Note:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Metrics are stored in memory only</li>
                  <li>History resets on page reload</li>
                  <li>Export data before clearing</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
