/**
 * Performance Monitoring System for SUMRY
 * Tracks Web Vitals, custom metrics, memory usage, and provides actionable insights
 */

// Performance metrics storage
const metricsHistory = {
  webVitals: [],
  customMetrics: [],
  memorySnapshots: [],
  apiCalls: [],
  componentRenders: [],
  networkRequests: []
};

// Performance thresholds and budgets
const PERFORMANCE_BUDGETS = {
  // Web Vitals thresholds (Google's Core Web Vitals)
  LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint (ms)
  FID: { good: 100, needsImprovement: 300 }, // First Input Delay (ms)
  CLS: { good: 0.1, needsImprovement: 0.25 }, // Cumulative Layout Shift
  TTFB: { good: 800, needsImprovement: 1800 }, // Time to First Byte (ms)
  FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint (ms)

  // Custom thresholds
  componentRender: { good: 16, needsImprovement: 50 }, // ms (60fps = 16.67ms per frame)
  apiCall: { good: 500, needsImprovement: 1500 }, // ms
  memoryUsage: { good: 50, needsImprovement: 75 }, // MB
  localStorageSize: { good: 5, needsImprovement: 8 }, // MB
  bundleSize: { good: 250, needsImprovement: 500 } // KB
};

// Performance monitoring state
let isMonitoring = false;
let performanceObserver = null;
let memoryInterval = null;
let listeners = new Set();

/**
 * Initialize performance monitoring
 */
export function initializePerformanceMonitoring() {
  if (isMonitoring) return;

  isMonitoring = true;

  // Monitor Web Vitals using Performance Observer API
  initializeWebVitalsMonitoring();

  // Monitor memory usage
  startMemoryMonitoring();

  // Monitor network requests
  monitorNetworkRequests();

  // Monitor page visibility changes
  monitorPageVisibility();

  // Track initial page load metrics
  trackPageLoadMetrics();

  console.log('[Performance Monitor] Initialized successfully');
}

/**
 * Stop performance monitoring
 */
export function stopPerformanceMonitoring() {
  if (!isMonitoring) return;

  isMonitoring = false;

  if (performanceObserver) {
    performanceObserver.disconnect();
    performanceObserver = null;
  }

  if (memoryInterval) {
    clearInterval(memoryInterval);
    memoryInterval = null;
  }

  console.log('[Performance Monitor] Stopped');
}

/**
 * Initialize Web Vitals monitoring using Performance Observer
 */
function initializeWebVitalsMonitoring() {
  // Check if PerformanceObserver is supported
  if (!window.PerformanceObserver) {
    console.warn('[Performance Monitor] PerformanceObserver not supported');
    return;
  }

  try {
    // Observe paint timing (FCP)
    const paintObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          recordWebVital('FCP', entry.startTime);
        }
      }
    });
    paintObserver.observe({ entryTypes: ['paint'] });

    // Observe largest contentful paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      recordWebVital('LCP', lastEntry.renderTime || lastEntry.loadTime);
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // Observe first input delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        recordWebVital('FID', entry.processingStart - entry.startTime);
      }
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // Observe layout shifts (CLS)
    let clsValue = 0;
    let clsEntries = [];
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          clsEntries.push(entry);
          recordWebVital('CLS', clsValue);
        }
      }
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });

  } catch (error) {
    console.error('[Performance Monitor] Error initializing Web Vitals:', error);
  }

  // Track TTFB from navigation timing
  if (window.performance && window.performance.timing) {
    window.addEventListener('load', () => {
      const timing = window.performance.timing;
      const ttfb = timing.responseStart - timing.requestStart;
      recordWebVital('TTFB', ttfb);
    });
  }
}

/**
 * Record Web Vital metric
 */
function recordWebVital(name, value) {
  const metric = {
    name,
    value,
    timestamp: Date.now(),
    rating: getRating(name, value)
  };

  metricsHistory.webVitals.push(metric);
  notifyListeners({ type: 'webVital', metric });

  // Keep only last 100 metrics per type
  const typeMetrics = metricsHistory.webVitals.filter(m => m.name === name);
  if (typeMetrics.length > 100) {
    const index = metricsHistory.webVitals.indexOf(typeMetrics[0]);
    metricsHistory.webVitals.splice(index, 1);
  }
}

/**
 * Get rating for a metric value
 */
function getRating(metricName, value) {
  const budget = PERFORMANCE_BUDGETS[metricName];
  if (!budget) return 'unknown';

  if (value <= budget.good) return 'good';
  if (value <= budget.needsImprovement) return 'needs-improvement';
  return 'poor';
}

/**
 * Track page load metrics
 */
function trackPageLoadMetrics() {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const domContentLoadedTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
      const timeToInteractive = perfData.domInteractive - perfData.navigationStart;

      recordCustomMetric('pageLoadTime', pageLoadTime);
      recordCustomMetric('domContentLoadedTime', domContentLoadedTime);
      recordCustomMetric('timeToInteractive', timeToInteractive);
    }, 0);
  });
}

/**
 * Record custom metric
 */
export function recordCustomMetric(name, value, metadata = {}) {
  const metric = {
    name,
    value,
    timestamp: Date.now(),
    metadata
  };

  metricsHistory.customMetrics.push(metric);
  notifyListeners({ type: 'customMetric', metric });

  // Keep only last 1000 custom metrics
  if (metricsHistory.customMetrics.length > 1000) {
    metricsHistory.customMetrics.shift();
  }
}

/**
 * Track component render time
 */
export function trackComponentRender(componentName, renderTime, metadata = {}) {
  const render = {
    componentName,
    renderTime,
    timestamp: Date.now(),
    rating: getRating('componentRender', renderTime),
    metadata
  };

  metricsHistory.componentRenders.push(render);
  notifyListeners({ type: 'componentRender', render });

  // Keep only last 500 renders
  if (metricsHistory.componentRenders.length > 500) {
    metricsHistory.componentRenders.shift();
  }
}

/**
 * Track API call performance
 */
export function trackAPICall(endpoint, duration, status, metadata = {}) {
  const apiCall = {
    endpoint,
    duration,
    status,
    timestamp: Date.now(),
    rating: getRating('apiCall', duration),
    metadata
  };

  metricsHistory.apiCalls.push(apiCall);
  notifyListeners({ type: 'apiCall', apiCall });

  // Keep only last 200 API calls
  if (metricsHistory.apiCalls.length > 200) {
    metricsHistory.apiCalls.shift();
  }
}

/**
 * Start memory monitoring
 */
function startMemoryMonitoring() {
  // Check if performance.memory is available (Chrome only)
  if (!performance.memory) {
    console.warn('[Performance Monitor] Memory API not available');
    return;
  }

  const captureMemorySnapshot = () => {
    const memory = performance.memory;
    const usedMB = memory.usedJSHeapSize / (1024 * 1024);
    const totalMB = memory.totalJSHeapSize / (1024 * 1024);
    const limitMB = memory.jsHeapSizeLimit / (1024 * 1024);

    const snapshot = {
      usedMB,
      totalMB,
      limitMB,
      usagePercent: (usedMB / limitMB) * 100,
      timestamp: Date.now(),
      rating: getRating('memoryUsage', usedMB)
    };

    metricsHistory.memorySnapshots.push(snapshot);
    notifyListeners({ type: 'memory', snapshot });

    // Keep only last 100 snapshots
    if (metricsHistory.memorySnapshots.length > 100) {
      metricsHistory.memorySnapshots.shift();
    }
  };

  // Capture initial snapshot
  captureMemorySnapshot();

  // Capture snapshot every 10 seconds
  memoryInterval = setInterval(captureMemorySnapshot, 10000);
}

/**
 * Get localStorage usage
 */
export function getLocalStorageUsage() {
  let total = 0;

  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }

  const bytes = total * 2; // UTF-16 uses 2 bytes per character
  const kb = bytes / 1024;
  const mb = kb / 1024;

  return {
    bytes,
    kb,
    mb,
    items: localStorage.length,
    rating: getRating('localStorageSize', mb)
  };
}

/**
 * Monitor network requests
 */
function monitorNetworkRequests() {
  if (!window.PerformanceObserver) return;

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const request = {
          name: entry.name,
          duration: entry.duration,
          size: entry.transferSize,
          type: entry.initiatorType,
          timestamp: Date.now()
        };

        metricsHistory.networkRequests.push(request);
        notifyListeners({ type: 'networkRequest', request });

        // Keep only last 200 requests
        if (metricsHistory.networkRequests.length > 200) {
          metricsHistory.networkRequests.shift();
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });
  } catch (error) {
    console.error('[Performance Monitor] Error monitoring network:', error);
  }
}

/**
 * Monitor page visibility changes
 */
function monitorPageVisibility() {
  document.addEventListener('visibilitychange', () => {
    recordCustomMetric('pageVisibility', document.hidden ? 'hidden' : 'visible');
  });
}

/**
 * Calculate performance score (0-100)
 */
export function calculatePerformanceScore() {
  const scores = [];
  const weights = {
    webVitals: 0.4,
    customMetrics: 0.2,
    memory: 0.2,
    network: 0.1,
    localStorage: 0.1
  };

  // Web Vitals score
  const webVitalsScore = calculateWebVitalsScore();
  if (webVitalsScore !== null) {
    scores.push({ score: webVitalsScore, weight: weights.webVitals });
  }

  // Component render score
  const renderScore = calculateComponentRenderScore();
  if (renderScore !== null) {
    scores.push({ score: renderScore, weight: weights.customMetrics });
  }

  // Memory score
  const memoryScore = calculateMemoryScore();
  if (memoryScore !== null) {
    scores.push({ score: memoryScore, weight: weights.memory });
  }

  // Network score
  const networkScore = calculateNetworkScore();
  if (networkScore !== null) {
    scores.push({ score: networkScore, weight: weights.network });
  }

  // LocalStorage score
  const storageScore = calculateStorageScore();
  if (storageScore !== null) {
    scores.push({ score: storageScore, weight: weights.localStorage });
  }

  if (scores.length === 0) return null;

  // Calculate weighted average
  const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
  const weightedSum = scores.reduce((sum, s) => sum + (s.score * s.weight), 0);

  return Math.round(weightedSum / totalWeight);
}

/**
 * Calculate Web Vitals score
 */
function calculateWebVitalsScore() {
  const recentVitals = {};

  // Get most recent value for each vital
  ['LCP', 'FID', 'CLS', 'TTFB', 'FCP'].forEach(vital => {
    const metrics = metricsHistory.webVitals.filter(m => m.name === vital);
    if (metrics.length > 0) {
      recentVitals[vital] = metrics[metrics.length - 1];
    }
  });

  if (Object.keys(recentVitals).length === 0) return null;

  const scores = Object.values(recentVitals).map(metric => {
    if (metric.rating === 'good') return 100;
    if (metric.rating === 'needs-improvement') return 50;
    return 0;
  });

  return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}

/**
 * Calculate component render score
 */
function calculateComponentRenderScore() {
  if (metricsHistory.componentRenders.length === 0) return null;

  const recentRenders = metricsHistory.componentRenders.slice(-20);
  const avgRenderTime = recentRenders.reduce((sum, r) => sum + r.renderTime, 0) / recentRenders.length;

  const budget = PERFORMANCE_BUDGETS.componentRender;
  if (avgRenderTime <= budget.good) return 100;
  if (avgRenderTime <= budget.needsImprovement) return 50;
  return Math.max(0, 50 - ((avgRenderTime - budget.needsImprovement) / budget.needsImprovement) * 50);
}

/**
 * Calculate memory score
 */
function calculateMemoryScore() {
  if (metricsHistory.memorySnapshots.length === 0) return null;

  const latest = metricsHistory.memorySnapshots[metricsHistory.memorySnapshots.length - 1];
  const usedMB = latest.usedMB;

  const budget = PERFORMANCE_BUDGETS.memoryUsage;
  if (usedMB <= budget.good) return 100;
  if (usedMB <= budget.needsImprovement) return 50;
  return Math.max(0, 50 - ((usedMB - budget.needsImprovement) / budget.needsImprovement) * 50);
}

/**
 * Calculate network score
 */
function calculateNetworkScore() {
  if (metricsHistory.networkRequests.length === 0) return null;

  const recentRequests = metricsHistory.networkRequests.slice(-20);
  const avgDuration = recentRequests.reduce((sum, r) => sum + r.duration, 0) / recentRequests.length;

  if (avgDuration <= 100) return 100;
  if (avgDuration <= 500) return 75;
  if (avgDuration <= 1000) return 50;
  return 25;
}

/**
 * Calculate localStorage score
 */
function calculateStorageScore() {
  const usage = getLocalStorageUsage();
  const budget = PERFORMANCE_BUDGETS.localStorageSize;

  if (usage.mb <= budget.good) return 100;
  if (usage.mb <= budget.needsImprovement) return 50;
  return 25;
}

/**
 * Get performance warnings
 */
export function getPerformanceWarnings() {
  const warnings = [];

  // Check Web Vitals
  ['LCP', 'FID', 'CLS', 'TTFB', 'FCP'].forEach(vital => {
    const metrics = metricsHistory.webVitals.filter(m => m.name === vital);
    if (metrics.length > 0) {
      const latest = metrics[metrics.length - 1];
      if (latest.rating === 'poor') {
        warnings.push({
          severity: 'high',
          metric: vital,
          value: latest.value,
          message: `${vital} is poor (${formatMetricValue(vital, latest.value)}). This may impact user experience.`,
          suggestion: getOptimizationSuggestion(vital)
        });
      } else if (latest.rating === 'needs-improvement') {
        warnings.push({
          severity: 'medium',
          metric: vital,
          value: latest.value,
          message: `${vital} needs improvement (${formatMetricValue(vital, latest.value)}).`,
          suggestion: getOptimizationSuggestion(vital)
        });
      }
    }
  });

  // Check memory usage
  if (metricsHistory.memorySnapshots.length > 0) {
    const latest = metricsHistory.memorySnapshots[metricsHistory.memorySnapshots.length - 1];
    if (latest.usagePercent > 80) {
      warnings.push({
        severity: 'high',
        metric: 'Memory',
        value: latest.usedMB,
        message: `High memory usage (${latest.usedMB.toFixed(2)} MB, ${latest.usagePercent.toFixed(1)}%).`,
        suggestion: 'Check for memory leaks, reduce component state, or implement virtualization for large lists.'
      });
    }
  }

  // Check localStorage usage
  const storage = getLocalStorageUsage();
  if (storage.rating === 'poor') {
    warnings.push({
      severity: 'medium',
      metric: 'LocalStorage',
      value: storage.mb,
      message: `LocalStorage usage is high (${storage.mb.toFixed(2)} MB).`,
      suggestion: 'Consider cleaning up old data or using IndexedDB for larger datasets.'
    });
  }

  // Check slow component renders
  const slowRenders = metricsHistory.componentRenders.filter(r => r.rating === 'poor');
  if (slowRenders.length > 0) {
    const componentCounts = {};
    slowRenders.forEach(r => {
      componentCounts[r.componentName] = (componentCounts[r.componentName] || 0) + 1;
    });

    Object.entries(componentCounts).forEach(([component, count]) => {
      if (count >= 5) {
        warnings.push({
          severity: 'medium',
          metric: 'Component Render',
          value: count,
          message: `${component} has ${count} slow renders.`,
          suggestion: 'Use React.memo, useMemo, or useCallback to optimize rendering.'
        });
      }
    });
  }

  // Check slow API calls
  const slowAPICalls = metricsHistory.apiCalls.filter(a => a.rating === 'poor');
  if (slowAPICalls.length > 0) {
    const endpointCounts = {};
    slowAPICalls.forEach(a => {
      endpointCounts[a.endpoint] = (endpointCounts[a.endpoint] || 0) + 1;
    });

    Object.entries(endpointCounts).forEach(([endpoint, count]) => {
      if (count >= 3) {
        warnings.push({
          severity: 'medium',
          metric: 'API Performance',
          value: count,
          message: `${endpoint} has ${count} slow responses.`,
          suggestion: 'Optimize backend queries, add caching, or implement pagination.'
        });
      }
    });
  }

  return warnings.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

/**
 * Format metric value for display
 */
function formatMetricValue(metric, value) {
  if (metric === 'CLS') {
    return value.toFixed(3);
  }
  return `${Math.round(value)}ms`;
}

/**
 * Get optimization suggestion for a metric
 */
function getOptimizationSuggestion(metric) {
  const suggestions = {
    LCP: 'Optimize images, reduce server response time, eliminate render-blocking resources, or use CDN.',
    FID: 'Reduce JavaScript execution time, break up long tasks, or use web workers for heavy computations.',
    CLS: 'Add size attributes to images/videos, avoid inserting content above existing content, or use CSS transform animations.',
    TTFB: 'Optimize server processing, use caching, or switch to a faster hosting provider.',
    FCP: 'Eliminate render-blocking resources, optimize fonts, or inline critical CSS.'
  };

  return suggestions[metric] || 'Review performance best practices.';
}

/**
 * Get metrics summary
 */
export function getMetricsSummary() {
  return {
    webVitals: getWebVitalsSummary(),
    componentRenders: getComponentRendersSummary(),
    apiCalls: getAPICallsSummary(),
    memory: getMemorySummary(),
    network: getNetworkSummary(),
    localStorage: getLocalStorageUsage()
  };
}

/**
 * Get Web Vitals summary
 */
function getWebVitalsSummary() {
  const summary = {};

  ['LCP', 'FID', 'CLS', 'TTFB', 'FCP'].forEach(vital => {
    const metrics = metricsHistory.webVitals.filter(m => m.name === vital);
    if (metrics.length > 0) {
      const latest = metrics[metrics.length - 1];
      const values = metrics.map(m => m.value);

      summary[vital] = {
        current: latest.value,
        rating: latest.rating,
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((sum, v) => sum + v, 0) / values.length,
        count: metrics.length
      };
    }
  });

  return summary;
}

/**
 * Get component renders summary
 */
function getComponentRendersSummary() {
  if (metricsHistory.componentRenders.length === 0) return null;

  const recentRenders = metricsHistory.componentRenders.slice(-50);
  const renderTimes = recentRenders.map(r => r.renderTime);

  // Count renders by component
  const componentCounts = {};
  const componentAvgTimes = {};

  recentRenders.forEach(r => {
    if (!componentCounts[r.componentName]) {
      componentCounts[r.componentName] = 0;
      componentAvgTimes[r.componentName] = [];
    }
    componentCounts[r.componentName]++;
    componentAvgTimes[r.componentName].push(r.renderTime);
  });

  // Get slowest components
  const slowestComponents = Object.entries(componentAvgTimes)
    .map(([name, times]) => ({
      name,
      avgTime: times.reduce((sum, t) => sum + t, 0) / times.length,
      count: times.length
    }))
    .sort((a, b) => b.avgTime - a.avgTime)
    .slice(0, 5);

  return {
    total: recentRenders.length,
    avgTime: renderTimes.reduce((sum, t) => sum + t, 0) / renderTimes.length,
    minTime: Math.min(...renderTimes),
    maxTime: Math.max(...renderTimes),
    slowestComponents
  };
}

/**
 * Get API calls summary
 */
function getAPICallsSummary() {
  if (metricsHistory.apiCalls.length === 0) return null;

  const recentCalls = metricsHistory.apiCalls.slice(-50);
  const durations = recentCalls.map(c => c.duration);

  // Success rate
  const successCount = recentCalls.filter(c => c.status >= 200 && c.status < 300).length;
  const successRate = (successCount / recentCalls.length) * 100;

  // Endpoint stats
  const endpointStats = {};
  recentCalls.forEach(call => {
    if (!endpointStats[call.endpoint]) {
      endpointStats[call.endpoint] = {
        count: 0,
        durations: [],
        errors: 0
      };
    }
    endpointStats[call.endpoint].count++;
    endpointStats[call.endpoint].durations.push(call.duration);
    if (call.status >= 400) {
      endpointStats[call.endpoint].errors++;
    }
  });

  const slowestEndpoints = Object.entries(endpointStats)
    .map(([endpoint, stats]) => ({
      endpoint,
      avgDuration: stats.durations.reduce((sum, d) => sum + d, 0) / stats.durations.length,
      count: stats.count,
      errors: stats.errors
    }))
    .sort((a, b) => b.avgDuration - a.avgDuration)
    .slice(0, 5);

  return {
    total: recentCalls.length,
    avgDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
    minDuration: Math.min(...durations),
    maxDuration: Math.max(...durations),
    successRate,
    slowestEndpoints
  };
}

/**
 * Get memory summary
 */
function getMemorySummary() {
  if (metricsHistory.memorySnapshots.length === 0) return null;

  const snapshots = metricsHistory.memorySnapshots;
  const latest = snapshots[snapshots.length - 1];
  const usedValues = snapshots.map(s => s.usedMB);

  return {
    current: latest.usedMB,
    total: latest.totalMB,
    limit: latest.limitMB,
    usagePercent: latest.usagePercent,
    min: Math.min(...usedValues),
    max: Math.max(...usedValues),
    avg: usedValues.reduce((sum, v) => sum + v, 0) / usedValues.length,
    trend: calculateTrend(usedValues)
  };
}

/**
 * Get network summary
 */
function getNetworkSummary() {
  if (metricsHistory.networkRequests.length === 0) return null;

  const recentRequests = metricsHistory.networkRequests.slice(-50);
  const durations = recentRequests.map(r => r.duration);
  const sizes = recentRequests.map(r => r.size).filter(s => s > 0);

  return {
    total: recentRequests.length,
    avgDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
    totalSize: sizes.reduce((sum, s) => sum + s, 0),
    avgSize: sizes.length > 0 ? sizes.reduce((sum, s) => sum + s, 0) / sizes.length : 0
  };
}

/**
 * Calculate trend from values
 */
function calculateTrend(values) {
  if (values.length < 2) return 'stable';

  const first = values.slice(0, Math.floor(values.length / 2));
  const second = values.slice(Math.floor(values.length / 2));

  const firstAvg = first.reduce((sum, v) => sum + v, 0) / first.length;
  const secondAvg = second.reduce((sum, v) => sum + v, 0) / second.length;

  const diff = secondAvg - firstAvg;
  const percentChange = (diff / firstAvg) * 100;

  if (percentChange > 10) return 'increasing';
  if (percentChange < -10) return 'decreasing';
  return 'stable';
}

/**
 * Export performance report
 */
export function exportPerformanceReport() {
  const report = {
    timestamp: new Date().toISOString(),
    score: calculatePerformanceScore(),
    summary: getMetricsSummary(),
    warnings: getPerformanceWarnings(),
    history: {
      webVitals: metricsHistory.webVitals.slice(-100),
      componentRenders: metricsHistory.componentRenders.slice(-100),
      apiCalls: metricsHistory.apiCalls.slice(-100),
      memorySnapshots: metricsHistory.memorySnapshots.slice(-50),
      networkRequests: metricsHistory.networkRequests.slice(-100)
    },
    budgets: PERFORMANCE_BUDGETS
  };

  return report;
}

/**
 * Export to CSV
 */
export function exportToCSV() {
  const lines = [];

  // Header
  lines.push('Timestamp,Metric Type,Metric Name,Value,Rating');

  // Web Vitals
  metricsHistory.webVitals.forEach(metric => {
    lines.push(`${new Date(metric.timestamp).toISOString()},Web Vital,${metric.name},${metric.value},${metric.rating}`);
  });

  // Component Renders
  metricsHistory.componentRenders.forEach(render => {
    lines.push(`${new Date(render.timestamp).toISOString()},Component Render,${render.componentName},${render.renderTime},${render.rating}`);
  });

  // API Calls
  metricsHistory.apiCalls.forEach(call => {
    lines.push(`${new Date(call.timestamp).toISOString()},API Call,${call.endpoint},${call.duration},${call.rating}`);
  });

  const csv = lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `performance-report-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Subscribe to performance updates
 */
export function subscribe(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/**
 * Notify all listeners
 */
function notifyListeners(data) {
  listeners.forEach(callback => callback(data));
}

/**
 * Clear all metrics history
 */
export function clearMetricsHistory() {
  metricsHistory.webVitals = [];
  metricsHistory.customMetrics = [];
  metricsHistory.memorySnapshots = [];
  metricsHistory.apiCalls = [];
  metricsHistory.componentRenders = [];
  metricsHistory.networkRequests = [];

  notifyListeners({ type: 'cleared' });
}

/**
 * Get all metrics history (for debugging)
 */
export function getMetricsHistory() {
  return { ...metricsHistory };
}

/**
 * Check if running in production
 */
export function isProduction() {
  return import.meta.env.PROD;
}

/**
 * Get performance budgets
 */
export function getPerformanceBudgets() {
  return { ...PERFORMANCE_BUDGETS };
}
