/**
 * Drag and Drop Utilities for SUMRY
 * Provides comprehensive utilities for drag-and-drop operations using @dnd-kit
 */

import { useSensors, useSensor, PointerSensor, KeyboardSensor, TouchSensor } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { restrictToWindowEdges, restrictToParentElement } from '@dnd-kit/modifiers';

/**
 * DnD Operation Types
 */
export const DND_OPERATIONS = {
  MOVE: 'move',
  COPY: 'copy',
  REORDER: 'reorder',
  CATEGORIZE: 'categorize',
  ASSIGN: 'assign',
};

/**
 * DnD Context Types for different draggable items
 */
export const DND_TYPES = {
  GOAL: 'goal',
  STUDENT: 'student',
  TASK: 'task',
  LOG: 'log',
  COLUMN: 'column',
};

/**
 * DnD Status Values for Kanban boards
 */
export const GOAL_STATUSES = {
  BACKLOG: 'backlog',
  ACTIVE: 'active',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ON_HOLD: 'on_hold',
};

/**
 * Configure DnD sensors with proper activation constraints
 * Supports mouse, keyboard, and touch devices
 */
export function useDndSensors() {
  return useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 250ms hold required on touch devices
        tolerance: 5, // 5px tolerance for movement during hold
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
}

/**
 * Get modifiers for constraining drag behavior
 */
export function getDndModifiers(type = 'window') {
  const modifierMap = {
    window: [restrictToWindowEdges],
    parent: [restrictToParentElement],
    none: [],
  };
  return modifierMap[type] || modifierMap.window;
}

/**
 * Create a draggable item data structure
 */
export function createDraggableData(id, type, data = {}, operation = DND_OPERATIONS.MOVE) {
  return {
    id,
    type,
    operation,
    ...data,
  };
}

/**
 * Check if a drop is valid based on drag and drop contexts
 */
export function isValidDrop(dragData, dropData) {
  if (!dragData || !dropData) return false;

  // Same container drops are always valid for reordering
  if (dragData.containerId === dropData.containerId) {
    return true;
  }

  // Type-specific validation
  if (dropData.acceptTypes && !dropData.acceptTypes.includes(dragData.type)) {
    return false;
  }

  // Operation-specific validation
  if (dropData.allowedOperations && !dropData.allowedOperations.includes(dragData.operation)) {
    return false;
  }

  // Custom validation function
  if (dropData.validate && typeof dropData.validate === 'function') {
    return dropData.validate(dragData);
  }

  return true;
}

/**
 * Get the visual state for a droppable zone
 */
export function getDropZoneState(isOver, isValidDrop) {
  if (!isOver) return 'idle';
  return isValidDrop ? 'valid' : 'invalid';
}

/**
 * Calculate the new index for a reordered item
 */
export function calculateReorderIndex(items, activeId, overId) {
  const oldIndex = items.findIndex(item => item.id === activeId);
  const newIndex = items.findIndex(item => item.id === overId);

  if (oldIndex === -1 || newIndex === -1) return null;

  return { oldIndex, newIndex };
}

/**
 * Reorder an array of items
 */
export function reorderArray(array, fromIndex, toIndex) {
  const newArray = [...array];
  const [removed] = newArray.splice(fromIndex, 1);
  newArray.splice(toIndex, 0, removed);
  return newArray;
}

/**
 * Move an item between arrays
 */
export function moveItemBetweenArrays(sourceArray, destArray, sourceIndex, destIndex = null) {
  const newSource = [...sourceArray];
  const newDest = [...destArray];

  const [removed] = newSource.splice(sourceIndex, 1);

  if (destIndex === null) {
    newDest.push(removed);
  } else {
    newDest.splice(destIndex, 0, removed);
  }

  return { source: newSource, destination: newDest };
}

/**
 * Copy an item between arrays (without removing from source)
 */
export function copyItemBetweenArrays(sourceArray, destArray, sourceIndex, destIndex = null) {
  const newDest = [...destArray];
  const itemToCopy = sourceArray[sourceIndex];

  if (!itemToCopy) return { source: sourceArray, destination: destArray };

  const copiedItem = { ...itemToCopy, id: `${itemToCopy.id}-copy-${Date.now()}` };

  if (destIndex === null) {
    newDest.push(copiedItem);
  } else {
    newDest.splice(destIndex, 0, copiedItem);
  }

  return { source: sourceArray, destination: newDest };
}

/**
 * Get animation styles for dragging
 */
export function getDragAnimationStyles(isDragging, transform) {
  if (!transform) {
    return {
      transform: 'none',
      opacity: 1,
    };
  }

  return {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
    transition: isDragging ? 'none' : 'transform 200ms ease',
  };
}

/**
 * Get styles for drag overlay (ghost)
 */
export function getDragOverlayStyles() {
  return {
    cursor: 'grabbing',
    opacity: 0.95,
    transform: 'rotate(-3deg)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
  };
}

/**
 * Get drop indicator position
 */
export function getDropIndicatorPosition(isOver, position = 'bottom') {
  if (!isOver) return null;
  return position; // 'top', 'bottom', 'left', 'right'
}

/**
 * Format items for sortable context
 */
export function formatSortableItems(items) {
  return items.map(item => ({
    ...item,
    id: item.id.toString(), // Ensure ID is a string
  }));
}

/**
 * Create a drop zone configuration
 */
export function createDropZoneConfig({
  id,
  acceptTypes = [],
  allowedOperations = [DND_OPERATIONS.MOVE],
  validate = null,
  onDrop = null,
  label = '',
}) {
  return {
    id,
    acceptTypes,
    allowedOperations,
    validate,
    onDrop,
    label,
  };
}

/**
 * Get column styles for Kanban board
 */
export function getKanbanColumnStyles(status) {
  const styleMap = {
    [GOAL_STATUSES.BACKLOG]: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      header: 'bg-gray-100',
      text: 'text-gray-700',
    },
    [GOAL_STATUSES.ACTIVE]: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      header: 'bg-blue-100',
      text: 'text-blue-700',
    },
    [GOAL_STATUSES.IN_PROGRESS]: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      header: 'bg-yellow-100',
      text: 'text-yellow-700',
    },
    [GOAL_STATUSES.COMPLETED]: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      header: 'bg-green-100',
      text: 'text-green-700',
    },
    [GOAL_STATUSES.ON_HOLD]: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      header: 'bg-orange-100',
      text: 'text-orange-700',
    },
  };

  return styleMap[status] || styleMap[GOAL_STATUSES.BACKLOG];
}

/**
 * Get status label for display
 */
export function getStatusLabel(status) {
  const labelMap = {
    [GOAL_STATUSES.BACKLOG]: 'Backlog',
    [GOAL_STATUSES.ACTIVE]: 'Active',
    [GOAL_STATUSES.IN_PROGRESS]: 'In Progress',
    [GOAL_STATUSES.COMPLETED]: 'Completed',
    [GOAL_STATUSES.ON_HOLD]: 'On Hold',
  };

  return labelMap[status] || status;
}

/**
 * Snap to grid utility
 */
export function snapToGrid(value, gridSize = 8) {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Create announcement for screen readers during drag
 */
export function createDragAnnouncement(action, itemType, itemName) {
  const announcements = {
    start: `Started dragging ${itemType}: ${itemName}`,
    move: `Moved ${itemType}: ${itemName}`,
    over: `${itemType} ${itemName} is over a drop zone`,
    end: `Dropped ${itemType}: ${itemName}`,
    cancel: `Cancelled dragging ${itemType}: ${itemName}`,
  };

  return announcements[action] || `${action} ${itemType}: ${itemName}`;
}

/**
 * Handle keyboard navigation for drag and drop
 */
export function handleDragKeyboard(event, handlers = {}) {
  const { onMove, onCancel, onDrop } = handlers;

  switch (event.key) {
    case 'Escape':
      if (onCancel) onCancel();
      break;
    case 'Enter':
    case ' ':
      if (onDrop) onDrop();
      break;
    case 'ArrowUp':
    case 'ArrowDown':
    case 'ArrowLeft':
    case 'ArrowRight':
      if (onMove) onMove(event.key);
      break;
    default:
      break;
  }
}

/**
 * Multi-select utilities
 */
export class MultiSelectManager {
  constructor() {
    this.selectedIds = new Set();
  }

  toggle(id) {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
    return Array.from(this.selectedIds);
  }

  select(id) {
    this.selectedIds.add(id);
    return Array.from(this.selectedIds);
  }

  deselect(id) {
    this.selectedIds.delete(id);
    return Array.from(this.selectedIds);
  }

  clear() {
    this.selectedIds.clear();
    return [];
  }

  isSelected(id) {
    return this.selectedIds.has(id);
  }

  getSelected() {
    return Array.from(this.selectedIds);
  }

  selectRange(items, fromId, toId) {
    const fromIndex = items.findIndex(item => item.id === fromId);
    const toIndex = items.findIndex(item => item.id === toId);

    if (fromIndex === -1 || toIndex === -1) return this.getSelected();

    const [start, end] = fromIndex < toIndex
      ? [fromIndex, toIndex]
      : [toIndex, fromIndex];

    for (let i = start; i <= end; i++) {
      this.selectedIds.add(items[i].id);
    }

    return this.getSelected();
  }
}

/**
 * Undo/Redo manager for drag operations
 */
export class DragUndoManager {
  constructor(maxHistory = 50) {
    this.history = [];
    this.currentIndex = -1;
    this.maxHistory = maxHistory;
  }

  push(state) {
    // Remove any states after current index
    this.history = this.history.slice(0, this.currentIndex + 1);

    // Add new state
    this.history.push(state);

    // Limit history size
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    } else {
      this.currentIndex++;
    }
  }

  undo() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.history[this.currentIndex];
    }
    return null;
  }

  redo() {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      return this.history[this.currentIndex];
    }
    return null;
  }

  canUndo() {
    return this.currentIndex > 0;
  }

  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }

  clear() {
    this.history = [];
    this.currentIndex = -1;
  }
}
