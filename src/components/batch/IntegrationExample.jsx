/**
 * SUMRY Batch Operations Integration Example
 *
 * This file demonstrates how to integrate the batch operations system
 * into the existing SUMRY App.jsx component.
 *
 * Copy and adapt the relevant sections to your views.
 *
 * @module IntegrationExample
 */

import React, { useState, useCallback } from 'react';
import { BatchActionBar, ACTION_TYPES, CONFIRMATION_LEVELS } from './BatchActionBar';
import { useBatchSelection } from '@/hooks/useBatchSelection';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
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
  ENTITY_TYPES,
} from '@/lib/batchOperations';
import { Trash2, Download, Copy, Edit3, Users, CheckCircle, Tag } from 'lucide-react';

// =============================================================================
// EXAMPLE 1: GOALS VIEW WITH BATCH OPERATIONS
// =============================================================================

/**
 * Goals view with comprehensive batch operations
 * Integrates seamlessly into existing SUMRY App.jsx
 */
export function GoalsViewWithBatch({ store, setStore, goals, students }) {
  // Setup batch selection
  const goalIds = goals.map(g => g.id);
  const {
    selectedIds,
    handleSelect,
    isSelected,
    selectAll,
    deselectAll,
  } = useBatchSelection(goalIds, {
    enableKeyboardShortcuts: true,
  });

  // Handle bulk actions
  const handleBulkAction = useCallback(async ({ actionType, selectedIds, params }) => {
    let newStore, result;

    switch (actionType) {
      case ACTION_TYPES.DELETE:
        // Bulk delete with cascade (deletes related logs)
        ({ store: newStore, result } = bulkDelete(
          store,
          ENTITY_TYPES.GOALS,
          selectedIds,
          {
            cascade: true, // Delete related logs
            transactional: false, // Continue on partial failures
          }
        ));
        break;

      case ACTION_TYPES.EXPORT:
        // Export selected goals to CSV
        ({ store: newStore, result } = bulkExport(
          store,
          ENTITY_TYPES.GOALS,
          selectedIds,
          {
            filename: `goals-export-${new Date().toISOString().slice(0, 10)}.csv`,
          }
        ));
        break;

      case ACTION_TYPES.DUPLICATE:
        // Duplicate selected goals
        ({ store: newStore, result } = bulkDuplicate(
          store,
          ENTITY_TYPES.GOALS,
          selectedIds,
          {
            transform: (duplicate, original) => {
              // Custom transformation for duplicates
              duplicate.aiGenerated = false; // Clear AI flag
            },
          }
        ));
        break;

      case ACTION_TYPES.STATUS_CHANGE:
        // Change status of multiple goals
        ({ store: newStore, result } = bulkStatusChange(
          store,
          ENTITY_TYPES.GOALS,
          selectedIds,
          params.status
        ));
        break;

      case ACTION_TYPES.ASSIGN:
        // Reassign goals to different student
        ({ store: newStore, result } = bulkAssign(
          store,
          ENTITY_TYPES.GOALS,
          selectedIds,
          {
            assignmentType: 'studentId',
            value: params.assignTo,
          },
          {
            validate: (updated) => {
              // Ensure the student exists
              return students.some(s => s.id === updated.studentId);
            },
          }
        ));
        break;

      case 'bulk_edit_area':
        // Custom bulk edit for goal area
        ({ store: newStore, result } = bulkEdit(
          store,
          ENTITY_TYPES.GOALS,
          selectedIds,
          { area: params.area }
        ));
        break;

      default:
        return { success: false, error: 'Unknown action type' };
    }

    // Update store if operation succeeded
    if (result.success || result.successCount > 0) {
      setStore(newStore);
    }

    return result;
  }, [store, setStore, students]);

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
      icon: Trash2,
      destructive: true,
      confirmLevel: CONFIRMATION_LEVELS.HARD,
      confirmTitle: 'Delete Goals',
      confirmDescription: 'This will permanently delete the selected goals and all their progress logs. This action cannot be undone.',
    },
    {
      type: ACTION_TYPES.EXPORT,
      label: 'Export',
      icon: Download,
      confirmLevel: CONFIRMATION_LEVELS.NONE,
    },
    {
      type: ACTION_TYPES.DUPLICATE,
      label: 'Duplicate',
      icon: Copy,
      confirmLevel: CONFIRMATION_LEVELS.SOFT,
    },
    {
      type: ACTION_TYPES.STATUS_CHANGE,
      label: 'Change Status',
      icon: CheckCircle,
      confirmLevel: CONFIRMATION_LEVELS.SOFT,
      requiresParams: true,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'completed', label: 'Completed' },
        { value: 'on-hold', label: 'On Hold' },
        { value: 'archived', label: 'Archived' },
      ],
    },
    {
      type: ACTION_TYPES.ASSIGN,
      label: 'Reassign to Student',
      icon: Users,
      confirmLevel: CONFIRMATION_LEVELS.SOFT,
      requiresParams: true,
      options: students.map(s => ({ value: s.id, label: s.name })),
    },
    {
      type: 'bulk_edit_area',
      label: 'Change Area',
      icon: Edit3,
      confirmLevel: CONFIRMATION_LEVELS.SOFT,
      requiresParams: true,
      options: [
        { value: 'Reading', label: 'Reading' },
        { value: 'Math', label: 'Math' },
        { value: 'Writing', label: 'Writing' },
        { value: 'Behavior', label: 'Behavior' },
        { value: 'Communication', label: 'Communication' },
        { value: 'Social Skills', label: 'Social Skills' },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {/* Batch Action Bar */}
      <BatchActionBar
        selectedIds={selectedIds}
        allIds={goalIds}
        onSelectionChange={(ids) => {}} // useBatchSelection handles this
        entityType="goals"
        entityTypeSingular="goal"
        actions={goalActions}
        onBulkAction={handleBulkAction}
        onUndo={handleUndo}
        canUndo={canUndo()}
        position="sticky"
      />

      {/* Goals List */}
      <div className="space-y-2">
        {goals.map(goal => {
          const student = students.find(s => s.id === goal.studentId);
          const selected = isSelected(goal.id);

          return (
            <Card
              key={goal.id}
              className={`cursor-pointer transition-all ${
                selected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
              }`}
              onClick={(e) => handleSelect(goal.id, e)}
            >
              <CardContent className="flex items-start gap-3 p-4">
                {/* Selection checkbox */}
                <Checkbox
                  checked={selected}
                  onCheckedChange={() => {}}
                  onClick={(e) => e.stopPropagation()}
                />

                {/* Goal content */}
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
// EXAMPLE 2: STUDENTS VIEW WITH BATCH OPERATIONS
// =============================================================================

export function StudentsViewWithBatch({ store, setStore, students }) {
  const studentIds = students.map(s => s.id);
  const {
    selectedIds,
    handleSelect,
    isSelected,
  } = useBatchSelection(studentIds);

  const handleBulkAction = useCallback(async ({ actionType, selectedIds, params }) => {
    let newStore, result;

    switch (actionType) {
      case ACTION_TYPES.DELETE:
        // Delete students and all related data
        ({ store: newStore, result } = bulkDelete(
          store,
          ENTITY_TYPES.STUDENTS,
          selectedIds,
          {
            cascade: true, // Deletes goals and logs too
          }
        ));
        break;

      case ACTION_TYPES.EXPORT:
        ({ store: newStore, result } = bulkExport(
          store,
          ENTITY_TYPES.STUDENTS,
          selectedIds
        ));
        break;

      case ACTION_TYPES.ASSIGN:
        // Assign students to cohort
        ({ store: newStore, result } = bulkAssign(
          store,
          ENTITY_TYPES.STUDENTS,
          selectedIds,
          {
            assignmentType: 'cohort',
            value: params.assignTo,
          }
        ));
        break;

      case 'bulk_edit_grade':
        ({ store: newStore, result } = bulkEdit(
          store,
          ENTITY_TYPES.STUDENTS,
          selectedIds,
          { grade: params.grade }
        ));
        break;

      default:
        return { success: false, error: 'Unknown action type' };
    }

    if (result.success || result.successCount > 0) {
      setStore(newStore);
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
      icon: Trash2,
      destructive: true,
      confirmLevel: CONFIRMATION_LEVELS.HARD,
      confirmDescription: 'This will delete the selected students and ALL their associated goals and progress logs. This cannot be undone.',
    },
    {
      type: ACTION_TYPES.EXPORT,
      label: 'Export',
      icon: Download,
      confirmLevel: CONFIRMATION_LEVELS.NONE,
    },
    {
      type: ACTION_TYPES.ASSIGN,
      label: 'Assign to Cohort',
      icon: Users,
      confirmLevel: CONFIRMATION_LEVELS.SOFT,
      requiresParams: true,
      options: [
        { value: 'cohort-a', label: 'Cohort A' },
        { value: 'cohort-b', label: 'Cohort B' },
        { value: 'cohort-c', label: 'Cohort C' },
      ],
    },
    {
      type: 'bulk_edit_grade',
      label: 'Update Grade',
      icon: Edit3,
      confirmLevel: CONFIRMATION_LEVELS.SOFT,
      requiresParams: true,
      options: [
        { value: 'K', label: 'Kindergarten' },
        { value: '1', label: '1st Grade' },
        { value: '2', label: '2nd Grade' },
        { value: '3', label: '3rd Grade' },
        { value: '4', label: '4th Grade' },
        { value: '5', label: '5th Grade' },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <BatchActionBar
        selectedIds={selectedIds}
        allIds={studentIds}
        onSelectionChange={() => {}}
        entityType="students"
        entityTypeSingular="student"
        actions={studentActions}
        onBulkAction={handleBulkAction}
        onUndo={handleUndo}
        canUndo={canUndo()}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map(student => {
          const selected = isSelected(student.id);

          return (
            <Card
              key={student.id}
              className={`cursor-pointer ${selected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
              onClick={(e) => handleSelect(student.id, e)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selected}
                    onCheckedChange={() => {}}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{student.name}</h3>
                    <p className="text-sm text-gray-600">Grade: {student.grade}</p>
                    <p className="text-sm text-gray-600">{student.disability}</p>
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
// EXAMPLE 3: PROGRESS LOGS VIEW WITH BATCH OPERATIONS
// =============================================================================

export function LogsViewWithBatch({ store, setStore, logs, goals, students }) {
  const logIds = logs.map(l => l.id);
  const {
    selectedIds,
    handleSelect,
    isSelected,
  } = useBatchSelection(logIds);

  const handleBulkAction = useCallback(async ({ actionType, selectedIds, params }) => {
    let newStore, result;

    switch (actionType) {
      case ACTION_TYPES.DELETE:
        ({ store: newStore, result } = bulkDelete(
          store,
          ENTITY_TYPES.LOGS,
          selectedIds
        ));
        break;

      case ACTION_TYPES.EXPORT:
        ({ store: newStore, result } = bulkExport(
          store,
          ENTITY_TYPES.LOGS,
          selectedIds
        ));
        break;

      default:
        return { success: false, error: 'Unknown action type' };
    }

    if (result.success || result.successCount > 0) {
      setStore(newStore);
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
      icon: Trash2,
      destructive: true,
      confirmLevel: CONFIRMATION_LEVELS.HARD,
    },
    {
      type: ACTION_TYPES.EXPORT,
      label: 'Export',
      icon: Download,
      confirmLevel: CONFIRMATION_LEVELS.NONE,
    },
  ];

  return (
    <div className="space-y-4">
      <BatchActionBar
        selectedIds={selectedIds}
        allIds={logIds}
        onSelectionChange={() => {}}
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
          const selected = isSelected(log.id);

          return (
            <Card
              key={log.id}
              className={`cursor-pointer ${selected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
              onClick={(e) => handleSelect(log.id, e)}
            >
              <CardContent className="flex items-start gap-3 p-4">
                <Checkbox
                  checked={selected}
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
                  {log.notes && <p className="text-sm text-gray-700 mt-2">{log.notes}</p>}
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
// USAGE IN APP.JSX
// =============================================================================

/*
To integrate into your App.jsx:

1. Import the components:
   import { GoalsViewWithBatch, StudentsViewWithBatch, LogsViewWithBatch } from '@/components/batch/IntegrationExample';

2. Replace your existing goal/student/log views with the batch-enabled versions:

   // In your render method, replace:
   <div>
     {goals.map(goal => <GoalCard key={goal.id} goal={goal} />)}
   </div>

   // With:
   <GoalsViewWithBatch
     store={store}
     setStore={setStore}
     goals={goals}
     students={students}
   />

3. That's it! Your views now have full batch operation support.

Note: The useBatchSelection hook automatically handles:
- Shift+Click for range selection
- Ctrl/Cmd+Click for toggle selection
- Ctrl/Cmd+A for select all
- Escape for deselect all
- Ctrl/Cmd+I for invert selection
*/

export default {
  GoalsViewWithBatch,
  StudentsViewWithBatch,
  LogsViewWithBatch,
};
