/**
 * SUMRY Batch Operations Engine
 *
 * A comprehensive batch operations system with:
 * - Bulk operations (edit, delete, export, assign, duplicate)
 * - Transaction support (all-or-nothing)
 * - Undo/redo capability
 * - Error handling with partial failure recovery
 * - Progress tracking
 * - Safe rollback mechanism
 *
 * @module batchOperations
 */

import { uid, createTimestamp, exportCSV, normalizeStoreData } from './data';

// =============================================================================
// CONSTANTS
// =============================================================================

export const BATCH_OPERATION_TYPES = {
  BULK_EDIT: 'bulk_edit',
  BULK_DELETE: 'bulk_delete',
  BULK_EXPORT: 'bulk_export',
  BULK_ASSIGN: 'bulk_assign',
  BULK_STATUS_CHANGE: 'bulk_status_change',
  BULK_DUPLICATE: 'bulk_duplicate',
  BULK_TAG: 'bulk_tag',
  BULK_CATEGORIZE: 'bulk_categorize',
};

export const ENTITY_TYPES = {
  STUDENTS: 'students',
  GOALS: 'goals',
  LOGS: 'logs',
  SCHEDULES: 'schedules',
  ACCOMMODATIONS: 'accommodations',
  BEHAVIOR_LOGS: 'behaviorLogs',
  PRESENT_LEVELS: 'presentLevels',
  SERVICE_LOGS: 'serviceLogs',
};

const MAX_HISTORY_SIZE = 50;

// =============================================================================
// OPERATION HISTORY
// =============================================================================

class OperationHistory {
  constructor() {
    this.history = [];
    this.currentIndex = -1;
  }

  push(operation) {
    // Remove any future operations if we're not at the end
    this.history = this.history.slice(0, this.currentIndex + 1);

    // Add new operation
    this.history.push(operation);

    // Limit history size
    if (this.history.length > MAX_HISTORY_SIZE) {
      this.history.shift();
    } else {
      this.currentIndex++;
    }
  }

  canUndo() {
    return this.currentIndex >= 0;
  }

  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }

  undo() {
    if (!this.canUndo()) return null;
    const operation = this.history[this.currentIndex];
    this.currentIndex--;
    return operation;
  }

  redo() {
    if (!this.canRedo()) return null;
    this.currentIndex++;
    return this.history[this.currentIndex];
  }

  getLastOperation() {
    if (this.currentIndex >= 0) {
      return this.history[this.currentIndex];
    }
    return null;
  }

  clear() {
    this.history = [];
    this.currentIndex = -1;
  }
}

// Global history instance
const operationHistory = new OperationHistory();

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Deep clone an object
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (Array.isArray(obj)) return obj.map(item => deepClone(item));

  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * Get entities from store by type
 */
function getEntities(store, entityType) {
  return store[entityType] || [];
}

/**
 * Set entities in store by type
 */
function setEntities(store, entityType, entities) {
  return {
    ...store,
    [entityType]: entities,
    lastUpdated: createTimestamp(),
  };
}

/**
 * Find entity by ID
 */
function findEntityById(entities, id) {
  return entities.find(entity => entity.id === id);
}

/**
 * Filter entities by IDs
 */
function filterEntitiesByIds(entities, ids) {
  const idSet = new Set(ids);
  return entities.filter(entity => idSet.has(entity.id));
}

/**
 * Remove entities by IDs
 */
function removeEntitiesByIds(entities, ids) {
  const idSet = new Set(ids);
  return entities.filter(entity => !idSet.has(entity.id));
}

// =============================================================================
// BATCH OPERATION RESULT
// =============================================================================

class BatchOperationResult {
  constructor() {
    this.success = true;
    this.totalItems = 0;
    this.successCount = 0;
    this.failureCount = 0;
    this.errors = [];
    this.affectedIds = [];
    this.snapshot = null;
    this.operationType = null;
    this.entityType = null;
    this.metadata = {};
  }

  addSuccess(id) {
    this.successCount++;
    this.affectedIds.push(id);
  }

  addFailure(id, error) {
    this.failureCount++;
    this.errors.push({ id, error: error.message || String(error) });
    this.success = false;
  }

  setSnapshot(snapshot) {
    this.snapshot = snapshot;
  }

  setMetadata(metadata) {
    this.metadata = metadata;
  }

  isPartialSuccess() {
    return this.successCount > 0 && this.failureCount > 0;
  }

  isCompleteFailure() {
    return this.successCount === 0 && this.failureCount > 0;
  }

  getSuccessRate() {
    if (this.totalItems === 0) return 0;
    return (this.successCount / this.totalItems) * 100;
  }

  getSummary() {
    return {
      success: this.success,
      total: this.totalItems,
      succeeded: this.successCount,
      failed: this.failureCount,
      successRate: this.getSuccessRate().toFixed(1) + '%',
      errors: this.errors,
      affectedIds: this.affectedIds,
    };
  }
}

// =============================================================================
// CORE BATCH OPERATIONS
// =============================================================================

/**
 * Create a snapshot of the current store state
 */
function createSnapshot(store, entityType, ids) {
  const entities = getEntities(store, entityType);
  const selectedEntities = filterEntitiesByIds(entities, ids);

  return {
    timestamp: createTimestamp(),
    entityType,
    entities: deepClone(selectedEntities),
    allEntities: deepClone(entities),
  };
}

/**
 * Restore from snapshot
 */
export function restoreFromSnapshot(store, snapshot) {
  if (!snapshot || !snapshot.entityType) {
    throw new Error('Invalid snapshot');
  }

  return setEntities(store, snapshot.entityType, snapshot.allEntities);
}

/**
 * Bulk edit - Update multiple items with the same changes
 */
export function bulkEdit(store, entityType, ids, updates, options = {}) {
  const result = new BatchOperationResult();
  result.operationType = BATCH_OPERATION_TYPES.BULK_EDIT;
  result.entityType = entityType;
  result.totalItems = ids.length;

  // Create snapshot for undo
  const snapshot = createSnapshot(store, entityType, ids);
  result.setSnapshot(snapshot);

  try {
    const entities = getEntities(store, entityType);
    const updatedEntities = entities.map(entity => {
      if (!ids.includes(entity.id)) return entity;

      try {
        // Apply updates
        const updated = { ...entity, ...updates };

        // Validate if validator provided
        if (options.validate && !options.validate(updated)) {
          throw new Error('Validation failed');
        }

        result.addSuccess(entity.id);
        return updated;
      } catch (error) {
        result.addFailure(entity.id, error);

        // If transactional, throw to rollback all changes
        if (options.transactional) {
          throw new Error(`Transaction failed at item ${entity.id}: ${error.message}`);
        }

        // Otherwise, keep original entity
        return entity;
      }
    });

    // If transactional and any failures, restore snapshot
    if (options.transactional && result.failureCount > 0) {
      throw new Error('Transaction rolled back due to failures');
    }

    const newStore = setEntities(store, entityType, updatedEntities);

    // Record operation for undo
    if (result.successCount > 0) {
      operationHistory.push({
        type: BATCH_OPERATION_TYPES.BULK_EDIT,
        entityType,
        snapshot,
        result: result.getSummary(),
      });
    }

    return { store: newStore, result };
  } catch (error) {
    result.success = false;
    result.errors.push({ error: error.message });
    return { store, result };
  }
}

/**
 * Bulk delete - Remove multiple items
 */
export function bulkDelete(store, entityType, ids, options = {}) {
  const result = new BatchOperationResult();
  result.operationType = BATCH_OPERATION_TYPES.BULK_DELETE;
  result.entityType = entityType;
  result.totalItems = ids.length;

  // Create snapshot for undo
  const snapshot = createSnapshot(store, entityType, ids);
  result.setSnapshot(snapshot);

  try {
    let entities = getEntities(store, entityType);
    const idsToDelete = [];

    // Check if we need to cascade delete
    if (options.cascade) {
      ids.forEach(id => {
        try {
          // Validate deletion if validator provided
          if (options.validate && !options.validate(id, store)) {
            throw new Error('Validation failed');
          }

          idsToDelete.push(id);
          result.addSuccess(id);
        } catch (error) {
          result.addFailure(id, error);

          if (options.transactional) {
            throw new Error(`Transaction failed at item ${id}: ${error.message}`);
          }
        }
      });
    } else {
      ids.forEach(id => {
        idsToDelete.push(id);
        result.addSuccess(id);
      });
    }

    // If transactional and any failures, rollback
    if (options.transactional && result.failureCount > 0) {
      throw new Error('Transaction rolled back due to failures');
    }

    // Perform deletion
    let newStore = store;
    if (idsToDelete.length > 0) {
      entities = removeEntitiesByIds(entities, idsToDelete);
      newStore = setEntities(store, entityType, entities);

      // Handle cascading deletes
      if (options.cascade) {
        newStore = handleCascadeDelete(newStore, entityType, idsToDelete);
      }
    }

    // Record operation for undo
    if (result.successCount > 0) {
      operationHistory.push({
        type: BATCH_OPERATION_TYPES.BULK_DELETE,
        entityType,
        snapshot,
        result: result.getSummary(),
      });
    }

    return { store: newStore, result };
  } catch (error) {
    result.success = false;
    result.errors.push({ error: error.message });
    return { store, result };
  }
}

/**
 * Handle cascade deletion of related entities
 */
function handleCascadeDelete(store, entityType, deletedIds) {
  let newStore = { ...store };

  switch (entityType) {
    case ENTITY_TYPES.STUDENTS:
      // Delete all goals for deleted students
      newStore.goals = newStore.goals.filter(
        goal => !deletedIds.includes(goal.studentId)
      );
      // Delete all logs for deleted goals
      const goalIds = new Set(newStore.goals.map(g => g.id));
      newStore.logs = newStore.logs.filter(
        log => goalIds.has(log.goalId)
      );
      break;

    case ENTITY_TYPES.GOALS:
      // Delete all logs for deleted goals
      newStore.logs = newStore.logs.filter(
        log => !deletedIds.includes(log.goalId)
      );
      break;

    default:
      break;
  }

  return newStore;
}

/**
 * Bulk export - Export selected items to CSV
 */
export function bulkExport(store, entityType, ids, options = {}) {
  const result = new BatchOperationResult();
  result.operationType = BATCH_OPERATION_TYPES.BULK_EXPORT;
  result.entityType = entityType;
  result.totalItems = ids.length;

  try {
    const entities = getEntities(store, entityType);
    const selectedEntities = filterEntitiesByIds(entities, ids);

    // Build CSV data based on entity type
    const csvData = buildCSVData(selectedEntities, entityType, store, options);

    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = options.filename || `${entityType}-export-${timestamp}.csv`;

    // Export CSV
    exportCSV(csvData, filename);

    result.successCount = ids.length;
    result.affectedIds = ids;
    result.setMetadata({ filename, rowCount: csvData.length - 1 }); // -1 for header

    return { store, result };
  } catch (error) {
    result.success = false;
    result.errors.push({ error: error.message });
    return { store, result };
  }
}

/**
 * Build CSV data for export
 */
function buildCSVData(entities, entityType, store, options) {
  const rows = [];

  switch (entityType) {
    case ENTITY_TYPES.STUDENTS:
      rows.push(['ID', 'Name', 'Grade', 'Disability', 'Created At']);
      entities.forEach(student => {
        rows.push([
          student.id,
          student.name,
          student.grade,
          student.disability,
          student.createdAt,
        ]);
      });
      break;

    case ENTITY_TYPES.GOALS:
      rows.push(['ID', 'Student Name', 'Area', 'Description', 'Baseline', 'Target', 'Metric', 'Created At']);
      entities.forEach(goal => {
        const student = store.students.find(s => s.id === goal.studentId);
        rows.push([
          goal.id,
          student ? student.name : 'Unknown',
          goal.area,
          goal.description,
          goal.baseline,
          goal.target,
          goal.metric,
          goal.createdAt,
        ]);
      });
      break;

    case ENTITY_TYPES.LOGS:
      rows.push(['ID', 'Goal', 'Student', 'Date', 'Score', 'Notes', 'Accommodations']);
      entities.forEach(log => {
        const goal = store.goals.find(g => g.id === log.goalId);
        const student = goal ? store.students.find(s => s.id === goal.studentId) : null;
        rows.push([
          log.id,
          goal ? goal.description : 'Unknown',
          student ? student.name : 'Unknown',
          log.dateISO,
          log.score,
          log.notes,
          (log.accommodationsUsed || []).join('; '),
        ]);
      });
      break;

    default:
      rows.push(['ID', 'Data']);
      entities.forEach(entity => {
        rows.push([entity.id, JSON.stringify(entity)]);
      });
      break;
  }

  return rows;
}

/**
 * Bulk assign - Assign multiple items to a target
 */
export function bulkAssign(store, entityType, ids, assignment, options = {}) {
  const result = new BatchOperationResult();
  result.operationType = BATCH_OPERATION_TYPES.BULK_ASSIGN;
  result.entityType = entityType;
  result.totalItems = ids.length;

  // Create snapshot for undo
  const snapshot = createSnapshot(store, entityType, ids);
  result.setSnapshot(snapshot);

  try {
    const entities = getEntities(store, entityType);
    const updatedEntities = entities.map(entity => {
      if (!ids.includes(entity.id)) return entity;

      try {
        // Apply assignment based on entity type and assignment type
        const updated = applyAssignment(entity, assignment, options);

        result.addSuccess(entity.id);
        return updated;
      } catch (error) {
        result.addFailure(entity.id, error);

        if (options.transactional) {
          throw new Error(`Transaction failed at item ${entity.id}: ${error.message}`);
        }

        return entity;
      }
    });

    // If transactional and any failures, rollback
    if (options.transactional && result.failureCount > 0) {
      throw new Error('Transaction rolled back due to failures');
    }

    const newStore = setEntities(store, entityType, updatedEntities);

    // Record operation for undo
    if (result.successCount > 0) {
      operationHistory.push({
        type: BATCH_OPERATION_TYPES.BULK_ASSIGN,
        entityType,
        snapshot,
        result: result.getSummary(),
      });
    }

    return { store: newStore, result };
  } catch (error) {
    result.success = false;
    result.errors.push({ error: error.message });
    return { store, result };
  }
}

/**
 * Apply assignment to entity
 */
function applyAssignment(entity, assignment, options) {
  const { assignmentType, value } = assignment;

  switch (assignmentType) {
    case 'cohort':
      return { ...entity, cohort: value };

    case 'teacher':
      return { ...entity, teacherId: value };

    case 'category':
      return { ...entity, category: value };

    case 'tag':
      // Add tag if not present
      const tags = entity.tags || [];
      if (!tags.includes(value)) {
        return { ...entity, tags: [...tags, value] };
      }
      return entity;

    case 'removeTag':
      // Remove tag if present
      const currentTags = entity.tags || [];
      return { ...entity, tags: currentTags.filter(tag => tag !== value) };

    default:
      return { ...entity, [assignmentType]: value };
  }
}

/**
 * Bulk status change - Change status of multiple items
 */
export function bulkStatusChange(store, entityType, ids, status, options = {}) {
  const result = new BatchOperationResult();
  result.operationType = BATCH_OPERATION_TYPES.BULK_STATUS_CHANGE;
  result.entityType = entityType;
  result.totalItems = ids.length;

  // Create snapshot for undo
  const snapshot = createSnapshot(store, entityType, ids);
  result.setSnapshot(snapshot);

  try {
    const entities = getEntities(store, entityType);
    const updatedEntities = entities.map(entity => {
      if (!ids.includes(entity.id)) return entity;

      try {
        const updated = { ...entity, status, statusUpdatedAt: createTimestamp() };
        result.addSuccess(entity.id);
        return updated;
      } catch (error) {
        result.addFailure(entity.id, error);

        if (options.transactional) {
          throw new Error(`Transaction failed at item ${entity.id}: ${error.message}`);
        }

        return entity;
      }
    });

    const newStore = setEntities(store, entityType, updatedEntities);

    // Record operation for undo
    if (result.successCount > 0) {
      operationHistory.push({
        type: BATCH_OPERATION_TYPES.BULK_STATUS_CHANGE,
        entityType,
        snapshot,
        result: result.getSummary(),
      });
    }

    return { store: newStore, result };
  } catch (error) {
    result.success = false;
    result.errors.push({ error: error.message });
    return { store, result };
  }
}

/**
 * Bulk duplicate - Create copies of selected items
 */
export function bulkDuplicate(store, entityType, ids, options = {}) {
  const result = new BatchOperationResult();
  result.operationType = BATCH_OPERATION_TYPES.BULK_DUPLICATE;
  result.entityType = entityType;
  result.totalItems = ids.length;

  const newIds = [];

  try {
    const entities = getEntities(store, entityType);
    const duplicates = [];

    ids.forEach(id => {
      try {
        const original = findEntityById(entities, id);
        if (!original) {
          throw new Error('Entity not found');
        }

        const newId = uid();
        const duplicate = {
          ...deepClone(original),
          id: newId,
          createdAt: createTimestamp(),
          duplicatedFrom: id,
        };

        // Apply custom transform if provided
        if (options.transform) {
          options.transform(duplicate, original);
        }

        // Update name/title to indicate it's a copy
        if (duplicate.name) {
          duplicate.name = `${duplicate.name} (Copy)`;
        } else if (duplicate.description) {
          duplicate.description = `${duplicate.description} (Copy)`;
        }

        duplicates.push(duplicate);
        newIds.push(newId);
        result.addSuccess(id);
      } catch (error) {
        result.addFailure(id, error);

        if (options.transactional) {
          throw new Error(`Transaction failed at item ${id}: ${error.message}`);
        }
      }
    });

    // If transactional and any failures, rollback
    if (options.transactional && result.failureCount > 0) {
      throw new Error('Transaction rolled back due to failures');
    }

    const newEntities = [...entities, ...duplicates];
    const newStore = setEntities(store, entityType, newEntities);

    result.setMetadata({ newIds });

    return { store: newStore, result };
  } catch (error) {
    result.success = false;
    result.errors.push({ error: error.message });
    return { store, result };
  }
}

// =============================================================================
// UNDO/REDO OPERATIONS
// =============================================================================

/**
 * Undo the last batch operation
 */
export function undoLastOperation(store) {
  const operation = operationHistory.undo();

  if (!operation || !operation.snapshot) {
    return {
      store,
      result: {
        success: false,
        message: 'No operation to undo',
      },
    };
  }

  try {
    const restoredStore = restoreFromSnapshot(store, operation.snapshot);

    return {
      store: restoredStore,
      result: {
        success: true,
        message: `Undid ${operation.type} operation`,
        operation: operation.type,
        affectedCount: operation.snapshot.entities.length,
      },
    };
  } catch (error) {
    // Restore history position
    operationHistory.redo();

    return {
      store,
      result: {
        success: false,
        message: `Failed to undo: ${error.message}`,
      },
    };
  }
}

/**
 * Redo the last undone operation
 */
export function redoLastOperation(store) {
  const operation = operationHistory.redo();

  if (!operation) {
    return {
      store,
      result: {
        success: false,
        message: 'No operation to redo',
      },
    };
  }

  // For redo, we need to re-execute the operation
  // This is complex, so for now we'll just indicate it's not supported
  // In a real implementation, you'd store the forward action as well

  return {
    store,
    result: {
      success: false,
      message: 'Redo not yet implemented',
    },
  };
}

/**
 * Check if undo is available
 */
export function canUndo() {
  return operationHistory.canUndo();
}

/**
 * Check if redo is available
 */
export function canRedo() {
  return operationHistory.canRedo();
}

/**
 * Get the last operation
 */
export function getLastOperation() {
  return operationHistory.getLastOperation();
}

/**
 * Clear operation history
 */
export function clearHistory() {
  operationHistory.clear();
}

// =============================================================================
// SELECTION UTILITIES
// =============================================================================

/**
 * Handle shift+click range selection
 */
export function handleRangeSelection(currentSelection, allIds, clickedId, lastSelectedId) {
  if (!lastSelectedId) {
    return [clickedId];
  }

  const startIndex = allIds.indexOf(lastSelectedId);
  const endIndex = allIds.indexOf(clickedId);

  if (startIndex === -1 || endIndex === -1) {
    return [clickedId];
  }

  const [start, end] = startIndex < endIndex
    ? [startIndex, endIndex]
    : [endIndex, startIndex];

  const rangeIds = allIds.slice(start, end + 1);

  // Merge with current selection
  const selectionSet = new Set([...currentSelection, ...rangeIds]);
  return Array.from(selectionSet);
}

/**
 * Handle ctrl+click toggle selection
 */
export function handleToggleSelection(currentSelection, clickedId) {
  const selectionSet = new Set(currentSelection);

  if (selectionSet.has(clickedId)) {
    selectionSet.delete(clickedId);
  } else {
    selectionSet.add(clickedId);
  }

  return Array.from(selectionSet);
}

/**
 * Select all items
 */
export function selectAll(allIds) {
  return [...allIds];
}

/**
 * Deselect all items
 */
export function deselectAll() {
  return [];
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  // Operations
  bulkEdit,
  bulkDelete,
  bulkExport,
  bulkAssign,
  bulkStatusChange,
  bulkDuplicate,

  // Undo/Redo
  undoLastOperation,
  redoLastOperation,
  canUndo,
  canRedo,
  getLastOperation,
  clearHistory,

  // Selection
  handleRangeSelection,
  handleToggleSelection,
  selectAll,
  deselectAll,

  // Utilities
  restoreFromSnapshot,

  // Constants
  BATCH_OPERATION_TYPES,
  ENTITY_TYPES,
};
