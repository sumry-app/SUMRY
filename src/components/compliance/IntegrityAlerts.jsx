import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle, Info, CheckCircle, X } from 'lucide-react';

/**
 * IntegrityAlerts - Feature #24: Integrity Alerts for Missing Data
 *
 * Automated alerts for data quality issues
 * Helps maintain compliance and completeness
 */
export default function IntegrityAlerts({ students, goals, logs, onResolve, onDismiss }) {
  const alerts = useMemo(() => {
    const issues = [];
    const today = new Date();
    const weekAgo = new Date(today - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today - 30 * 24 * 60 * 60 * 1000);

    // Check for students with no recent data
    students.forEach(student => {
      const studentLogs = logs.filter(l => l.studentId === student.id);
      const recentLogs = studentLogs.filter(l => new Date(l.dateISO) >= weekAgo);

      if (recentLogs.length === 0 && studentLogs.length > 0) {
        issues.push({
          id: `no-data-${student.id}`,
          severity: 'warning',
          type: 'missing_data',
          title: 'No Recent Data',
          message: `${student.name} has no data entries in the past 7 days`,
          studentId: student.id,
          action: 'Log Progress',
          createdAt: new Date().toISOString()
        });
      }

      if (studentLogs.length === 0) {
        issues.push({
          id: `never-logged-${student.id}`,
          severity: 'critical',
          type: 'never_logged',
          title: 'No Data Ever Recorded',
          message: `${student.name} has never had progress data logged`,
          studentId: student.id,
          action: 'Start Logging',
          createdAt: new Date().toISOString()
        });
      }
    });

    // Check for goals with no data
    goals.forEach(goal => {
      const goalLogs = logs.filter(l => l.goalId === goal.id);
      const student = students.find(s => s.id === goal.studentId);

      if (goalLogs.length === 0 && goal.createdAt) {
        const daysSinceCreation = Math.floor(
          (today - new Date(goal.createdAt)) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceCreation > 7) {
          issues.push({
            id: `goal-no-data-${goal.id}`,
            severity: 'warning',
            type: 'goal_no_data',
            title: 'Goal Has No Data',
            message: `"${goal.description.slice(0, 50)}..." for ${student?.name} has no progress data`,
            goalId: goal.id,
            studentId: goal.studentId,
            action: 'Log Progress',
            createdAt: new Date().toISOString()
          });
        }
      }

      // Check for goals with declining performance
      if (goalLogs.length >= 5) {
        const recent5 = goalLogs.slice(-5);
        const scores = recent5.map(l => l.stats?.accuracy || 0);
        const avgRecent = scores.reduce((a, b) => a + b, 0) / scores.length;

        if (avgRecent < 40) {
          issues.push({
            id: `goal-declining-${goal.id}`,
            severity: 'critical',
            type: 'poor_performance',
            title: 'Significant Performance Concern',
            message: `${student?.name} averaging ${avgRecent}% on "${goal.description.slice(0, 40)}..."`,
            goalId: goal.id,
            studentId: goal.studentId,
            action: 'Review Goal',
            createdAt: new Date().toISOString()
          });
        }
      }
    });

    // Check for incomplete data entries
    logs.forEach(log => {
      if (!log.notes && (!log.trials || log.trials.length === 0)) {
        const student = students.find(s => s.id === log.studentId);
        const goal = goals.find(g => g.id === log.goalId);

        issues.push({
          id: `incomplete-log-${log.id}`,
          severity: 'info',
          type: 'incomplete_data',
          title: 'Incomplete Data Entry',
          message: `Log for ${student?.name} on ${log.dateISO} missing trials or notes`,
          logId: log.id,
          studentId: log.studentId,
          action: 'Complete Entry',
          createdAt: log.timestamp || log.dateISO
        });
      }
    });

    return issues.sort((a, b) => {
      // Sort by severity
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      // Then by date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [students, goals, logs]);

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-orange-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Data Integrity Alerts</h2>
              <p className="text-sm text-gray-600">
                {alerts.length} active alert{alerts.length !== 1 ? 's' : ''} requiring attention
              </p>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{criticalCount}</div>
                <div className="text-xs text-gray-600">Critical</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{warningCount}</div>
                <div className="text-xs text-gray-600">Warnings</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
            <h3 className="font-semibold text-gray-900 mb-2">All Clear!</h3>
            <p className="text-sm text-gray-600">No data integrity issues detected.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => {
            const Icon = {
              critical: AlertTriangle,
              warning: AlertCircle,
              info: Info
            }[alert.severity];

            const colorClasses = {
              critical: {
                card: 'border-red-300 bg-red-50',
                icon: 'text-red-600',
                badge: 'bg-red-100 text-red-700 border-red-300'
              },
              warning: {
                card: 'border-orange-300 bg-orange-50',
                icon: 'text-orange-600',
                badge: 'bg-orange-100 text-orange-700 border-orange-300'
              },
              info: {
                card: 'border-blue-300 bg-blue-50',
                icon: 'text-blue-600',
                badge: 'bg-blue-100 text-blue-700 border-blue-300'
              }
            }[alert.severity];

            return (
              <Card key={alert.id} className={`border-2 ${colorClasses.card}`}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-2 bg-white rounded-lg">
                      <Icon className={`w-6 h-6 ${colorClasses.icon}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={colorClasses.badge}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {alert.type.replace('_', ' ')}
                        </Badge>
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-1">
                        {alert.title}
                      </h3>
                      <p className="text-sm text-gray-700 mb-3">
                        {alert.message}
                      </p>

                      <div className="text-xs text-gray-500 mb-3">
                        {new Date(alert.createdAt).toLocaleDateString()} at{' '}
                        {new Date(alert.createdAt).toLocaleTimeString()}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => onResolve?.(alert)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {alert.action}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDismiss?.(alert.id)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Generate alerts automatically
export function generateIntegrityAlerts(students, goals, logs) {
  const component = IntegrityAlerts({ students, goals, logs });
  return component;
}
