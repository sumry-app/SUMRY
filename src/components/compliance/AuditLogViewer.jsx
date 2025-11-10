import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Clock, User, FileText, Search, Filter } from 'lucide-react';

/**
 * AuditLogViewer - Feature #34: Timestamped Audit Viewer
 *
 * Complete audit trail of all system actions
 * FERPA compliance requirement
 */
export default function AuditLogViewer({ auditLog, users }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterUser, setFilterUser] = useState('all');

  const actionTypes = [...new Set(auditLog.map(log => log.action))];

  const filteredLogs = useMemo(() => {
    return auditLog.filter(log => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          log.action.toLowerCase().includes(search) ||
          log.details?.toLowerCase().includes(search) ||
          log.userId?.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      // Action filter
      if (filterAction !== 'all' && log.action !== filterAction) {
        return false;
      }

      // User filter
      if (filterUser !== 'all' && log.userId !== filterUser) {
        return false;
      }

      return true;
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [auditLog, searchTerm, filterAction, filterUser]);

  const getActionColor = (action) => {
    if (action.includes('create') || action.includes('add')) return 'bg-green-100 text-green-700 border-green-300';
    if (action.includes('update') || action.includes('edit')) return 'bg-blue-100 text-blue-700 border-blue-300';
    if (action.includes('delete') || action.includes('remove')) return 'bg-red-100 text-red-700 border-red-300';
    if (action.includes('export')) return 'bg-purple-100 text-purple-700 border-purple-300';
    if (action.includes('login') || action.includes('logout')) return 'bg-gray-100 text-gray-700 border-gray-300';
    return 'bg-yellow-100 text-yellow-700 border-yellow-300';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Audit Log</h2>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search logs..."
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {actionTypes.map(action => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={filterUser} onValueChange={setFilterUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredLogs.length}</div>
              <div className="text-xs text-gray-600">Total Entries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {new Set(filteredLogs.map(l => l.userId)).size}
              </div>
              <div className="text-xs text-gray-600">Unique Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(filteredLogs.map(l => l.action)).size}
              </div>
              <div className="text-xs text-gray-600">Action Types</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs */}
      <div className="space-y-2">
        {filteredLogs.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No audit logs found matching your criteria</p>
            </CardContent>
          </Card>
        ) : (
          filteredLogs.map(log => {
            const user = users.find(u => u.id === log.userId);

            return (
              <Card key={log.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={getActionColor(log.action)}>
                          {log.action}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(log.timestamp).toLocaleString()}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {user?.name || log.userId}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({user?.role || 'Unknown'})
                        </span>
                      </div>

                      {log.details && (
                        <p className="text-sm text-gray-700">{log.details}</p>
                      )}

                      {log.metadata && (
                        <div className="mt-2 text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">
                          {JSON.stringify(log.metadata, null, 2)}
                        </div>
                      )}

                      {log.ipAddress && (
                        <div className="mt-2 text-xs text-gray-500">
                          IP: {log.ipAddress}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

// Helper to log audit events
export function logAuditEvent(action, userId, details, metadata = {}) {
  return {
    id: `audit_${Date.now()}_${Math.random()}`,
    timestamp: new Date().toISOString(),
    action,
    userId,
    details,
    metadata,
    ipAddress: 'localhost', // Would be populated by backend
    userAgent: navigator.userAgent
  };
}

// Common audit actions
export const AUDIT_ACTIONS = {
  // Authentication
  LOGIN: 'user_login',
  LOGOUT: 'user_logout',

  // Student operations
  STUDENT_CREATE: 'student_create',
  STUDENT_UPDATE: 'student_update',
  STUDENT_DELETE: 'student_delete',
  STUDENT_VIEW: 'student_view',

  // Goal operations
  GOAL_CREATE: 'goal_create',
  GOAL_UPDATE: 'goal_update',
  GOAL_DELETE: 'goal_delete',

  // Progress operations
  PROGRESS_LOG: 'progress_log_create',
  PROGRESS_UPDATE: 'progress_log_update',
  PROGRESS_DELETE: 'progress_log_delete',

  // Export operations
  DATA_EXPORT: 'data_export',
  REPORT_GENERATE: 'report_generate',

  // Administrative
  USER_CREATE: 'user_create',
  USER_UPDATE: 'user_update',
  USER_DELETE: 'user_delete',
  SETTINGS_UPDATE: 'settings_update',

  // Compliance
  DATA_ACCESS: 'data_access',
  DATA_DELETION_REQUEST: 'data_deletion_request'
};
