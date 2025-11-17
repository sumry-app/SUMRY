/**
 * SUMRY Batch Operations Demo
 *
 * Comprehensive example showing how to integrate batch operations
 * with different entity types in SUMRY.
 *
 * This demo shows:
 * - Goals batch operations
 * - Students batch operations
 * - Progress logs batch operations
 * - Multi-select with keyboard shortcuts
 * - Undo/redo functionality
 * - Error handling
 *
 * @module BatchOperationsDemo
 */

import React, { useState, useCallback, useRef } from 'react';
import { BatchActionBar, ACTION_TYPES, CONFIRMATION_LEVELS } from './BatchActionBar';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  bulkEdit,
  bulkDelete,
  bulkExport,
  bulkAssign,
  bulkStatusChange,
  bulkDuplicate,
  undoLastOperation,
  canUndo,
  handleRangeSelection,
  handleToggleSelection,
  ENTITY_TYPES,
} from '@/lib/batchOperations';

// =============================================================================
// GOALS BATCH OPERATIONS EXAMPLE
// =============================================================================

export function GoalsBatchOperations({ store, setStore, goals, students }) {
  const [selectedGoalIds, setSelectedGoalIds] = useState([]);
  const [lastSelectedId, setLastSelectedId] = useState(null);

  const goalIds = goals.map(g => g.id);

  // Handle individual goal selection
  const handleGoalSelect = useCallback((goalId, event) => {
    if (event.shiftKey && lastSelectedId) {
      // Shift+Click: Range select
      const newSelection = handleRangeSelection(
        selectedGoalIds,
        goalIds,
        goalId,
        lastSelectedId
      );
      setSelectedGoalIds(newSelection);
    } else if (event.ctrlKey || event.metaKey) {
      // Ctrl/Cmd+Click: Toggle select
      const newSelection = handleToggleSelection(selectedGoalIds, goalId);
      setSelectedGoalIds(newSelection);
    } else {
      // Normal click: Single select
      setSelectedGoalIds([goalId]);
    }
    setLastSelectedId(goalId);
  }, [selectedGoalIds, goalIds, lastSelectedId]);

  // Handle bulk actions
  const handleBulkAction = useCallback(async ({ actionType, selectedIds, params }) => {
    let result;

    switch (actionType) {
      case ACTION_TYPES.DELETE:
        ({ store: result.store, result } = bulkDelete(
          store,
          ENTITY_TYPES.GOALS,
          selectedIds,
          { cascade: true, transactional: false }
        ));
        break;

      case ACTION_TYPES.EXPORT:
        ({ store: result.store, result } = bulkExport(
          store,
          ENTITY_TYPES.GOALS,
          selectedIds,
          { filename: `goals-export-${new Date().toISOString().slice(0, 10)}.csv` }
        ));
        break;

      case ACTION_TYPES.DUPLICATE:
        ({ store: result.store, result } = bulkDuplicate(
          store,
          ENTITY_TYPES.GOALS,
          selectedIds
        ));
        break;

      case ACTION_TYPES.STATUS_CHANGE:
        ({ store: result.store, result } = bulkStatusChange(
          store,
          ENTITY_TYPES.GOALS,
          selectedIds,
          params.status
        ));
        break;

      case ACTION_TYPES.ASSIGN:
        ({ store: result.store, result } = bulkAssign(
          store,
          ENTITY_TYPES.GOALS,
          selectedIds,
          {
            assignmentType: 'studentId',
            value: params.assignTo,
          }
        ));
        break;

      default:
        return { success: false, error: 'Unknown action type' };
    }

    if (result.success || result.successCount > 0) {
      setStore(result.store);
    }

    return result;
  }, [store, setStore]);

  // Handle undo
  const handleUndo = useCallback(() => {
    const { store: restoredStore, result } = undoLastOperation(store);
    if (result.success) {
      setStore(restoredStore);
    }
  }, [store, setStore]);

  // Define available actions for goals
  const goalActions = [
    {
      type: ACTION_TYPES.DELETE,
      label: 'Delete',
      icon: 'Trash2',
      destructive: true,
      confirmLevel: CONFIRMATION_LEVELS.HARD,
    },
    {
      type: ACTION_TYPES.EXPORT,
      label: 'Export',
      icon: 'Download',
      confirmLevel: CONFIRMATION_LEVELS.NONE,
    },
    {
      type: ACTION_TYPES.DUPLICATE,
      label: 'Duplicate',
      icon: 'Copy',
      confirmLevel: CONFIRMATION_LEVELS.SOFT,
    },
    {
      type: ACTION_TYPES.STATUS_CHANGE,
      label: 'Change Status',
      icon: 'CheckCircle',
      confirmLevel: CONFIRMATION_LEVELS.SOFT,
      requiresParams: true,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'completed', label: 'Completed' },
        { value: 'archived', label: 'Archived' },
      ],
    },
    {
      type: ACTION_TYPES.ASSIGN,
      label: 'Assign to Student',
      icon: 'Users',
      confirmLevel: CONFIRMATION_LEVELS.SOFT,
      requiresParams: true,
      options: students.map(s => ({ value: s.id, label: s.name })),
    },
  ];

  return (
    <div className="space-y-4">
      <BatchActionBar
        selectedIds={selectedGoalIds}
        allIds={goalIds}
        onSelectionChange={setSelectedGoalIds}
        entityType="goals"
        entityTypeSingular="goal"
        actions={goalActions}
        onBulkAction={handleBulkAction}
        onUndo={handleUndo}
        canUndo={canUndo()}
        position="sticky"
      />

      <div className="space-y-2">
        {goals.map(goal => {
          const student = students.find(s => s.id === goal.studentId);
          const isSelected = selectedGoalIds.includes(goal.id);

          return (
            <Card
              key={goal.id}
              className={`cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
              }`}
              onClick={(e) => handleGoalSelect(goal.id, e)}
            >
              <CardContent className="flex items-start gap-3 p-4">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => {}}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">{goal.area}</Badge>
                    {student && (
                      <span className="text-sm text-gray-600">{student.name}</span>
                    )}
                  </div>
                  <p className="text-sm font-medium">{goal.description}</p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>Baseline: {goal.baseline}</span>
                    <span>Target: {goal.target}</span>
                    {goal.metric && <span>Metric: {goal.metric}</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// STUDENTS BATCH OPERATIONS EXAMPLE
// =============================================================================

export function StudentsBatchOperations({ store, setStore, students }) {
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [lastSelectedId, setLastSelectedId] = useState(null);

  const studentIds = students.map(s => s.id);

  const handleStudentSelect = useCallback((studentId, event) => {
    if (event.shiftKey && lastSelectedId) {
      const newSelection = handleRangeSelection(
        selectedStudentIds,
        studentIds,
        studentId,
        lastSelectedId
      );
      setSelectedStudentIds(newSelection);
    } else if (event.ctrlKey || event.metaKey) {
      const newSelection = handleToggleSelection(selectedStudentIds, studentId);
      setSelectedStudentIds(newSelection);
    } else {
      setSelectedStudentIds([studentId]);
    }
    setLastSelectedId(studentId);
  }, [selectedStudentIds, studentIds, lastSelectedId]);

  const handleBulkAction = useCallback(async ({ actionType, selectedIds, params }) => {
    let result;

    switch (actionType) {
      case ACTION_TYPES.DELETE:
        ({ store: result.store, result } = bulkDelete(
          store,
          ENTITY_TYPES.STUDENTS,
          selectedIds,
          { cascade: true }
        ));
        break;

      case ACTION_TYPES.EXPORT:
        ({ store: result.store, result } = bulkExport(
          store,
          ENTITY_TYPES.STUDENTS,
          selectedIds
        ));
        break;

      case ACTION_TYPES.ASSIGN:
        ({ store: result.store, result } = bulkAssign(
          store,
          ENTITY_TYPES.STUDENTS,
          selectedIds,
          {
            assignmentType: 'cohort',
            value: params.assignTo,
          }
        ));
        break;

      default:
        return { success: false, error: 'Unknown action type' };
    }

    if (result.success || result.successCount > 0) {
      setStore(result.store);
    }

    return result;
  }, [store, setStore]);

  const handleUndo = useCallback(() => {
    const { store: restoredStore, result } = undoLastOperation(store);
    if (result.success) {
      setStore(restoredStore);
    }
  }, [store, setStore]);

  const studentActions = [
    {
      type: ACTION_TYPES.DELETE,
      label: 'Delete',
      destructive: true,
      confirmLevel: CONFIRMATION_LEVELS.HARD,
      confirmDescription: 'This will delete the selected students and all their associated goals and progress logs.',
    },
    {
      type: ACTION_TYPES.EXPORT,
      label: 'Export',
      confirmLevel: CONFIRMATION_LEVELS.NONE,
    },
    {
      type: ACTION_TYPES.ASSIGN,
      label: 'Assign to Cohort',
      confirmLevel: CONFIRMATION_LEVELS.SOFT,
      requiresParams: true,
      options: [
        { value: 'cohort-a', label: 'Cohort A' },
        { value: 'cohort-b', label: 'Cohort B' },
        { value: 'cohort-c', label: 'Cohort C' },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <BatchActionBar
        selectedIds={selectedStudentIds}
        allIds={studentIds}
        onSelectionChange={setSelectedStudentIds}
        entityType="students"
        entityTypeSingular="student"
        actions={studentActions}
        onBulkAction={handleBulkAction}
        onUndo={handleUndo}
        canUndo={canUndo()}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map(student => {
          const isSelected = selectedStudentIds.includes(student.id);

          return (
            <Card
              key={student.id}
              className={`cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
              }`}
              onClick={(e) => handleStudentSelect(student.id, e)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => {}}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1">
                    <CardTitle className="text-base">{student.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>Grade: {student.grade}</div>
                  <div>Disability: {student.disability}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// PROGRESS LOGS BATCH OPERATIONS EXAMPLE
// =============================================================================

export function LogsBatchOperations({ store, setStore, logs, goals, students }) {
  const [selectedLogIds, setSelectedLogIds] = useState([]);
  const [lastSelectedId, setLastSelectedId] = useState(null);

  const logIds = logs.map(l => l.id);

  const handleLogSelect = useCallback((logId, event) => {
    if (event.shiftKey && lastSelectedId) {
      const newSelection = handleRangeSelection(
        selectedLogIds,
        logIds,
        logId,
        lastSelectedId
      );
      setSelectedLogIds(newSelection);
    } else if (event.ctrlKey || event.metaKey) {
      const newSelection = handleToggleSelection(selectedLogIds, logId);
      setSelectedLogIds(newSelection);
    } else {
      setSelectedLogIds([logId]);
    }
    setLastSelectedId(logId);
  }, [selectedLogIds, logIds, lastSelectedId]);

  const handleBulkAction = useCallback(async ({ actionType, selectedIds, params }) => {
    let result;

    switch (actionType) {
      case ACTION_TYPES.DELETE:
        ({ store: result.store, result } = bulkDelete(
          store,
          ENTITY_TYPES.LOGS,
          selectedIds
        ));
        break;

      case ACTION_TYPES.EXPORT:
        ({ store: result.store, result } = bulkExport(
          store,
          ENTITY_TYPES.LOGS,
          selectedIds
        ));
        break;

      default:
        return { success: false, error: 'Unknown action type' };
    }

    if (result.success || result.successCount > 0) {
      setStore(result.store);
    }

    return result;
  }, [store, setStore]);

  const handleUndo = useCallback(() => {
    const { store: restoredStore, result } = undoLastOperation(store);
    if (result.success) {
      setStore(restoredStore);
    }
  }, [store, setStore]);

  const logActions = [
    {
      type: ACTION_TYPES.DELETE,
      label: 'Delete',
      destructive: true,
      confirmLevel: CONFIRMATION_LEVELS.HARD,
    },
    {
      type: ACTION_TYPES.EXPORT,
      label: 'Export',
      confirmLevel: CONFIRMATION_LEVELS.NONE,
    },
  ];

  return (
    <div className="space-y-4">
      <BatchActionBar
        selectedIds={selectedLogIds}
        allIds={logIds}
        onSelectionChange={setSelectedLogIds}
        entityType="logs"
        entityTypeSingular="log"
        actions={logActions}
        onBulkAction={handleBulkAction}
        onUndo={handleUndo}
        canUndo={canUndo()}
      />

      <div className="space-y-2">
        {logs.map(log => {
          const goal = goals.find(g => g.id === log.goalId);
          const student = goal ? students.find(s => s.id === goal.studentId) : null;
          const isSelected = selectedLogIds.includes(log.id);

          return (
            <Card
              key={log.id}
              className={`cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
              }`}
              onClick={(e) => handleLogSelect(log.id, e)}
            >
              <CardContent className="flex items-start gap-3 p-4">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => {}}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge>{log.dateISO}</Badge>
                    <span className="text-sm font-medium">Score: {log.score}</span>
                  </div>
                  {goal && <p className="text-sm text-gray-600">{goal.description}</p>}
                  {student && <p className="text-xs text-gray-500 mt-1">{student.name}</p>}
                  {log.notes && (
                    <p className="text-sm text-gray-700 mt-2">{log.notes}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  GoalsBatchOperations,
  StudentsBatchOperations,
  LogsBatchOperations,
};
