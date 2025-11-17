/**
 * SUMRY Batch Operations Tests
 *
 * Comprehensive test suite for the batch operations system.
 *
 * @module batchOperations.test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  bulkEdit,
  bulkDelete,
  bulkExport,
  bulkAssign,
  bulkStatusChange,
  bulkDuplicate,
  undoLastOperation,
  canUndo,
  canRedo,
  clearHistory,
  handleRangeSelection,
  handleToggleSelection,
  selectAll,
  deselectAll,
  ENTITY_TYPES,
} from '../batchOperations';
import { uid, createTimestamp } from '../data';

describe('Batch Operations', () => {
  let mockStore;

  beforeEach(() => {
    // Clear history before each test
    clearHistory();

    // Create a mock store with test data
    mockStore = {
      version: 1,
      lastUpdated: createTimestamp(),
      students: [
        { id: 'student1', name: 'Alice', grade: '3', disability: 'Learning Disability' },
        { id: 'student2', name: 'Bob', grade: '4', disability: 'ADHD' },
        { id: 'student3', name: 'Charlie', grade: '5', disability: 'Autism' },
      ],
      goals: [
        {
          id: 'goal1',
          studentId: 'student1',
          area: 'Reading',
          description: 'Read fluently',
          baseline: '60 WPM',
          target: '120 WPM',
          metric: 'WPM',
          status: 'active',
        },
        {
          id: 'goal2',
          studentId: 'student1',
          area: 'Math',
          description: 'Solve problems',
          baseline: '50%',
          target: '80%',
          metric: '% correct',
          status: 'active',
        },
        {
          id: 'goal3',
          studentId: 'student2',
          area: 'Behavior',
          description: 'Stay on task',
          baseline: '30%',
          target: '80%',
          metric: '% time',
          status: 'active',
        },
      ],
      logs: [
        { id: 'log1', goalId: 'goal1', dateISO: '2024-01-01', score: '70', notes: 'Good progress' },
        { id: 'log2', goalId: 'goal1', dateISO: '2024-01-02', score: '75', notes: '' },
        { id: 'log3', goalId: 'goal2', dateISO: '2024-01-01', score: '60', notes: '' },
      ],
      schedules: [],
      accommodations: [],
      behaviorLogs: [],
      presentLevels: [],
      serviceLogs: [],
      parentAccounts: [],
      teamMembers: [],
      assessments: [],
      compliance: [],
      aiSuggestions: [],
    };
  });

  // =============================================================================
  // BULK EDIT TESTS
  // =============================================================================

  describe('bulkEdit', () => {
    it('should update multiple goals with new values', () => {
      const ids = ['goal1', 'goal2'];
      const updates = { status: 'completed' };

      const { store: newStore, result } = bulkEdit(
        mockStore,
        ENTITY_TYPES.GOALS,
        ids,
        updates
      );

      expect(result.success).toBe(true);
      expect(result.successCount).toBe(2);
      expect(result.failureCount).toBe(0);

      const updatedGoals = newStore.goals.filter(g => ids.includes(g.id));
      expect(updatedGoals.every(g => g.status === 'completed')).toBe(true);
    });

    it('should create a snapshot for undo', () => {
      const ids = ['goal1'];
      const updates = { area: 'Writing' };

      const { result } = bulkEdit(mockStore, ENTITY_TYPES.GOALS, ids, updates);

      expect(result.snapshot).toBeDefined();
      expect(result.snapshot.entityType).toBe(ENTITY_TYPES.GOALS);
      expect(result.snapshot.entities.length).toBe(1);
    });

    it('should handle validation failures in non-transactional mode', () => {
      const ids = ['goal1', 'goal2', 'goal3'];
      const updates = { status: 'invalid' };

      const { result } = bulkEdit(
        mockStore,
        ENTITY_TYPES.GOALS,
        ids,
        updates,
        {
          validate: (goal) => ['active', 'completed', 'archived'].includes(goal.status),
        }
      );

      expect(result.success).toBe(false);
      expect(result.failureCount).toBe(3);
    });

    it('should rollback all changes in transactional mode on validation failure', () => {
      const ids = ['goal1', 'goal2'];
      const updates = { status: 'completed' };

      const { store: newStore, result } = bulkEdit(
        mockStore,
        ENTITY_TYPES.GOALS,
        ids,
        updates,
        {
          transactional: true,
          validate: (goal) => {
            // Fail validation for goal2
            return goal.id !== 'goal2';
          },
        }
      );

      expect(result.success).toBe(false);
      // In transactional mode, store should remain unchanged
      expect(newStore).toEqual(mockStore);
    });
  });

  // =============================================================================
  // BULK DELETE TESTS
  // =============================================================================

  describe('bulkDelete', () => {
    it('should delete multiple goals', () => {
      const ids = ['goal1', 'goal2'];

      const { store: newStore, result } = bulkDelete(
        mockStore,
        ENTITY_TYPES.GOALS,
        ids
      );

      expect(result.success).toBe(true);
      expect(result.successCount).toBe(2);
      expect(newStore.goals.length).toBe(mockStore.goals.length - 2);
      expect(newStore.goals.find(g => g.id === 'goal1')).toBeUndefined();
    });

    it('should cascade delete related logs when deleting goals', () => {
      const ids = ['goal1'];

      const { store: newStore, result } = bulkDelete(
        mockStore,
        ENTITY_TYPES.GOALS,
        ids,
        { cascade: true }
      );

      expect(result.success).toBe(true);
      // Should delete goal1's logs (log1, log2)
      expect(newStore.logs.find(l => l.goalId === 'goal1')).toBeUndefined();
      // Should keep goal2's logs
      expect(newStore.logs.find(l => l.goalId === 'goal2')).toBeDefined();
    });

    it('should cascade delete goals and logs when deleting students', () => {
      const ids = ['student1'];

      const { store: newStore, result } = bulkDelete(
        mockStore,
        ENTITY_TYPES.STUDENTS,
        ids,
        { cascade: true }
      );

      expect(result.success).toBe(true);
      // Should delete student1
      expect(newStore.students.find(s => s.id === 'student1')).toBeUndefined();
      // Should delete student1's goals (goal1, goal2)
      expect(newStore.goals.find(g => g.studentId === 'student1')).toBeUndefined();
      // Should delete logs for deleted goals
      expect(newStore.logs.find(l => ['log1', 'log2', 'log3'].includes(l.id))).toBeUndefined();
      // Should keep student2's goal
      expect(newStore.goals.find(g => g.id === 'goal3')).toBeDefined();
    });
  });

  // =============================================================================
  // BULK ASSIGN TESTS
  // =============================================================================

  describe('bulkAssign', () => {
    it('should assign goals to a different student', () => {
      const ids = ['goal1', 'goal2'];
      const assignment = {
        assignmentType: 'studentId',
        value: 'student2',
      };

      const { store: newStore, result } = bulkAssign(
        mockStore,
        ENTITY_TYPES.GOALS,
        ids,
        assignment
      );

      expect(result.success).toBe(true);
      expect(result.successCount).toBe(2);

      const reassignedGoals = newStore.goals.filter(g => ids.includes(g.id));
      expect(reassignedGoals.every(g => g.studentId === 'student2')).toBe(true);
    });

    it('should add tags to items', () => {
      const ids = ['goal1', 'goal2'];
      const assignment = {
        assignmentType: 'tag',
        value: 'priority',
      };

      const { store: newStore, result } = bulkAssign(
        mockStore,
        ENTITY_TYPES.GOALS,
        ids,
        assignment
      );

      expect(result.success).toBe(true);

      const taggedGoals = newStore.goals.filter(g => ids.includes(g.id));
      expect(taggedGoals.every(g => g.tags?.includes('priority'))).toBe(true);
    });

    it('should remove tags from items', () => {
      // First add a tag
      mockStore.goals[0].tags = ['priority', 'urgent'];

      const ids = ['goal1'];
      const assignment = {
        assignmentType: 'removeTag',
        value: 'urgent',
      };

      const { store: newStore, result } = bulkAssign(
        mockStore,
        ENTITY_TYPES.GOALS,
        ids,
        assignment
      );

      expect(result.success).toBe(true);

      const goal = newStore.goals.find(g => g.id === 'goal1');
      expect(goal.tags).toContain('priority');
      expect(goal.tags).not.toContain('urgent');
    });
  });

  // =============================================================================
  // BULK STATUS CHANGE TESTS
  // =============================================================================

  describe('bulkStatusChange', () => {
    it('should change status of multiple goals', () => {
      const ids = ['goal1', 'goal2'];
      const status = 'archived';

      const { store: newStore, result } = bulkStatusChange(
        mockStore,
        ENTITY_TYPES.GOALS,
        ids,
        status
      );

      expect(result.success).toBe(true);
      expect(result.successCount).toBe(2);

      const updatedGoals = newStore.goals.filter(g => ids.includes(g.id));
      expect(updatedGoals.every(g => g.status === 'archived')).toBe(true);
      expect(updatedGoals.every(g => g.statusUpdatedAt)).toBe(true);
    });
  });

  // =============================================================================
  // BULK DUPLICATE TESTS
  // =============================================================================

  describe('bulkDuplicate', () => {
    it('should create duplicates of selected goals', () => {
      const ids = ['goal1', 'goal2'];

      const { store: newStore, result } = bulkDuplicate(
        mockStore,
        ENTITY_TYPES.GOALS,
        ids
      );

      expect(result.success).toBe(true);
      expect(result.successCount).toBe(2);
      expect(newStore.goals.length).toBe(mockStore.goals.length + 2);

      // Check that duplicates have new IDs
      const newIds = result.metadata.newIds;
      expect(newIds.length).toBe(2);

      const duplicates = newStore.goals.filter(g => newIds.includes(g.id));
      expect(duplicates.length).toBe(2);
      expect(duplicates.every(g => g.description.includes('(Copy)'))).toBe(true);
    });

    it('should apply custom transform to duplicates', () => {
      const ids = ['goal1'];

      const { store: newStore, result } = bulkDuplicate(
        mockStore,
        ENTITY_TYPES.GOALS,
        ids,
        {
          transform: (duplicate, original) => {
            duplicate.customField = 'custom value';
          },
        }
      );

      expect(result.success).toBe(true);

      const newId = result.metadata.newIds[0];
      const duplicate = newStore.goals.find(g => g.id === newId);
      expect(duplicate.customField).toBe('custom value');
    });
  });

  // =============================================================================
  // UNDO/REDO TESTS
  // =============================================================================

  describe('undoLastOperation', () => {
    it('should undo a bulk edit operation', () => {
      const ids = ['goal1', 'goal2'];
      const updates = { status: 'completed' };

      const { store: editedStore } = bulkEdit(
        mockStore,
        ENTITY_TYPES.GOALS,
        ids,
        updates
      );

      expect(canUndo()).toBe(true);

      const { store: restoredStore, result } = undoLastOperation(editedStore);

      expect(result.success).toBe(true);
      expect(result.operation).toBe('bulk_edit');

      // Goals should be back to original status
      const restoredGoals = restoredStore.goals.filter(g => ids.includes(g.id));
      expect(restoredGoals.every(g => g.status === 'active')).toBe(true);
    });

    it('should undo a bulk delete operation', () => {
      const ids = ['goal1'];

      const { store: deletedStore } = bulkDelete(
        mockStore,
        ENTITY_TYPES.GOALS,
        ids
      );

      expect(deletedStore.goals.find(g => g.id === 'goal1')).toBeUndefined();

      const { store: restoredStore, result } = undoLastOperation(deletedStore);

      expect(result.success).toBe(true);
      // Goal should be restored
      expect(restoredStore.goals.find(g => g.id === 'goal1')).toBeDefined();
    });

    it('should return error when no operation to undo', () => {
      const { result } = undoLastOperation(mockStore);

      expect(result.success).toBe(false);
      expect(result.message).toContain('No operation to undo');
    });
  });

  // =============================================================================
  // SELECTION HELPER TESTS
  // =============================================================================

  describe('Selection Helpers', () => {
    it('should handle range selection', () => {
      const allIds = ['goal1', 'goal2', 'goal3'];
      const currentSelection = ['goal1'];
      const lastSelected = 'goal1';
      const clicked = 'goal3';

      const newSelection = handleRangeSelection(
        currentSelection,
        allIds,
        clicked,
        lastSelected
      );

      expect(newSelection).toContain('goal1');
      expect(newSelection).toContain('goal2');
      expect(newSelection).toContain('goal3');
    });

    it('should handle toggle selection', () => {
      const currentSelection = ['goal1', 'goal2'];

      // Toggle off goal1
      let newSelection = handleToggleSelection(currentSelection, 'goal1');
      expect(newSelection).not.toContain('goal1');
      expect(newSelection).toContain('goal2');

      // Toggle on goal3
      newSelection = handleToggleSelection(currentSelection, 'goal3');
      expect(newSelection).toContain('goal1');
      expect(newSelection).toContain('goal2');
      expect(newSelection).toContain('goal3');
    });

    it('should select all items', () => {
      const allIds = ['goal1', 'goal2', 'goal3'];
      const selected = selectAll(allIds);

      expect(selected).toEqual(allIds);
    });

    it('should deselect all items', () => {
      const selected = deselectAll();

      expect(selected).toEqual([]);
    });
  });

  // =============================================================================
  // EDGE CASES AND ERROR HANDLING
  // =============================================================================

  describe('Edge Cases', () => {
    it('should handle empty selection gracefully', () => {
      const { store: newStore, result } = bulkEdit(
        mockStore,
        ENTITY_TYPES.GOALS,
        [],
        { status: 'completed' }
      );

      expect(result.totalItems).toBe(0);
      expect(result.successCount).toBe(0);
      expect(newStore).toEqual(mockStore);
    });

    it('should handle non-existent IDs gracefully', () => {
      const ids = ['nonexistent1', 'nonexistent2'];

      const { store: newStore, result } = bulkEdit(
        mockStore,
        ENTITY_TYPES.GOALS,
        ids,
        { status: 'completed' }
      );

      expect(result.totalItems).toBe(2);
      expect(result.successCount).toBe(0);
    });

    it('should handle mixed valid and invalid IDs', () => {
      const ids = ['goal1', 'nonexistent', 'goal2'];

      const { store: newStore, result } = bulkEdit(
        mockStore,
        ENTITY_TYPES.GOALS,
        ids,
        { status: 'completed' }
      );

      expect(result.totalItems).toBe(3);
      expect(result.successCount).toBe(2);

      const updatedGoals = newStore.goals.filter(g => ['goal1', 'goal2'].includes(g.id));
      expect(updatedGoals.every(g => g.status === 'completed')).toBe(true);
    });
  });
});
