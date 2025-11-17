/**
 * SUMRY Batch Selection Hook
 *
 * A custom React hook for managing batch selection state with:
 * - Multi-select support
 * - Shift+Click range selection
 * - Ctrl+Click toggle selection
 * - Select all/deselect all
 * - Keyboard shortcuts
 * - Selection persistence
 *
 * @module useBatchSelection
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  handleRangeSelection,
  handleToggleSelection,
  selectAll,
  deselectAll,
} from '@/lib/batchOperations';

/**
 * Custom hook for managing batch selection
 *
 * @param {Array} allIds - All available item IDs
 * @param {Object} options - Configuration options
 * @returns {Object} Selection state and handlers
 */
export function useBatchSelection(allIds = [], options = {}) {
  const {
    onSelectionChange,
    persistKey, // Key for localStorage persistence
    maxSelection, // Maximum number of items that can be selected
    enableKeyboardShortcuts = true,
  } = options;

  // =============================================================================
  // STATE
  // =============================================================================

  const [selectedIds, setSelectedIds] = useState(() => {
    // Load from localStorage if persist key provided
    if (persistKey && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`batch_selection_${persistKey}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Validate that stored IDs still exist
          return parsed.filter(id => allIds.includes(id));
        }
      } catch (error) {
        console.error('Failed to load selection from localStorage:', error);
      }
    }
    return [];
  });

  const [lastSelectedId, setLastSelectedId] = useState(null);
  const [selectionMode, setSelectionMode] = useState('normal'); // 'normal' | 'range' | 'toggle'

  const allIdsRef = useRef(allIds);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // Update allIds ref when it changes
  useEffect(() => {
    allIdsRef.current = allIds;

    // Clean up selected IDs that no longer exist
    setSelectedIds(prev => prev.filter(id => allIds.includes(id)));
  }, [allIds]);

  // Persist selection to localStorage
  useEffect(() => {
    if (persistKey && typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          `batch_selection_${persistKey}`,
          JSON.stringify(selectedIds)
        );
      } catch (error) {
        console.error('Failed to persist selection to localStorage:', error);
      }
    }
  }, [selectedIds, persistKey]);

  // Notify parent of selection changes
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedIds);
    }
  }, [selectedIds, onSelectionChange]);

  // =============================================================================
  // SELECTION HANDLERS
  // =============================================================================

  /**
   * Handle item selection with support for shift/ctrl modifiers
   */
  const handleSelect = useCallback((itemId, event) => {
    if (!itemId || !allIdsRef.current.includes(itemId)) return;

    let newSelection;

    if (event?.shiftKey && lastSelectedId) {
      // Shift+Click: Range select
      newSelection = handleRangeSelection(
        selectedIds,
        allIdsRef.current,
        itemId,
        lastSelectedId
      );
      setSelectionMode('range');
    } else if (event?.ctrlKey || event?.metaKey) {
      // Ctrl/Cmd+Click: Toggle select
      newSelection = handleToggleSelection(selectedIds, itemId);
      setSelectionMode('toggle');
    } else {
      // Normal click: Single select
      newSelection = [itemId];
      setSelectionMode('normal');
    }

    // Apply max selection limit if specified
    if (maxSelection && newSelection.length > maxSelection) {
      newSelection = newSelection.slice(0, maxSelection);
    }

    setSelectedIds(newSelection);
    setLastSelectedId(itemId);
  }, [selectedIds, lastSelectedId, maxSelection]);

  /**
   * Toggle selection of a single item
   */
  const toggleSelect = useCallback((itemId) => {
    if (!itemId || !allIdsRef.current.includes(itemId)) return;

    const newSelection = handleToggleSelection(selectedIds, itemId);
    setSelectedIds(newSelection);
    setLastSelectedId(itemId);
  }, [selectedIds]);

  /**
   * Select a single item (deselecting others)
   */
  const selectSingle = useCallback((itemId) => {
    if (!itemId || !allIdsRef.current.includes(itemId)) return;

    setSelectedIds([itemId]);
    setLastSelectedId(itemId);
  }, []);

  /**
   * Select multiple items
   */
  const selectMultiple = useCallback((itemIds) => {
    const validIds = itemIds.filter(id => allIdsRef.current.includes(id));

    // Apply max selection limit if specified
    const newSelection = maxSelection && validIds.length > maxSelection
      ? validIds.slice(0, maxSelection)
      : validIds;

    setSelectedIds(newSelection);
    if (newSelection.length > 0) {
      setLastSelectedId(newSelection[newSelection.length - 1]);
    }
  }, [maxSelection]);

  /**
   * Select all items
   */
  const handleSelectAll = useCallback(() => {
    const newSelection = selectAll(allIdsRef.current);

    // Apply max selection limit if specified
    const finalSelection = maxSelection && newSelection.length > maxSelection
      ? newSelection.slice(0, maxSelection)
      : newSelection;

    setSelectedIds(finalSelection);
  }, [maxSelection]);

  /**
   * Deselect all items
   */
  const handleDeselectAll = useCallback(() => {
    setSelectedIds(deselectAll());
    setLastSelectedId(null);
  }, []);

  /**
   * Toggle select all (select all if none selected, deselect if any selected)
   */
  const handleToggleSelectAll = useCallback(() => {
    if (selectedIds.length === 0) {
      handleSelectAll();
    } else {
      handleDeselectAll();
    }
  }, [selectedIds.length, handleSelectAll, handleDeselectAll]);

  /**
   * Select range of items
   */
  const selectRange = useCallback((startId, endId) => {
    if (!startId || !endId) return;
    if (!allIdsRef.current.includes(startId) || !allIdsRef.current.includes(endId)) return;

    const newSelection = handleRangeSelection(
      selectedIds,
      allIdsRef.current,
      endId,
      startId
    );

    setSelectedIds(newSelection);
    setLastSelectedId(endId);
  }, [selectedIds]);

  /**
   * Invert selection
   */
  const invertSelection = useCallback(() => {
    const selectedSet = new Set(selectedIds);
    const inverted = allIdsRef.current.filter(id => !selectedSet.has(id));

    // Apply max selection limit if specified
    const finalSelection = maxSelection && inverted.length > maxSelection
      ? inverted.slice(0, maxSelection)
      : inverted;

    setSelectedIds(finalSelection);
  }, [selectedIds, maxSelection]);

  // =============================================================================
  // KEYBOARD SHORTCUTS
  // =============================================================================

  useEffect(() => {
    if (!enableKeyboardShortcuts || typeof window === 'undefined') return;

    const handleKeyDown = (event) => {
      // Ctrl/Cmd + A: Select all
      if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
        // Only if focus is not in an input
        if (!['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
          event.preventDefault();
          handleSelectAll();
        }
      }

      // Escape: Deselect all
      if (event.key === 'Escape') {
        handleDeselectAll();
      }

      // Ctrl/Cmd + I: Invert selection
      if ((event.ctrlKey || event.metaKey) && event.key === 'i') {
        if (!['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
          event.preventDefault();
          invertSelection();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardShortcuts, handleSelectAll, handleDeselectAll, invertSelection]);

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const selectedCount = selectedIds.length;
  const allSelected = selectedCount === allIds.length && allIds.length > 0;
  const someSelected = selectedCount > 0 && !allSelected;
  const noneSelected = selectedCount === 0;

  const isSelected = useCallback(
    (itemId) => selectedIds.includes(itemId),
    [selectedIds]
  );

  const hasMaxSelection = maxSelection ? selectedCount >= maxSelection : false;

  // =============================================================================
  // RETURN
  // =============================================================================

  return {
    // State
    selectedIds,
    selectedCount,
    allSelected,
    someSelected,
    noneSelected,
    hasMaxSelection,
    selectionMode,

    // Handlers
    handleSelect,
    toggleSelect,
    selectSingle,
    selectMultiple,
    selectAll: handleSelectAll,
    deselectAll: handleDeselectAll,
    toggleSelectAll: handleToggleSelectAll,
    selectRange,
    invertSelection,

    // Utilities
    isSelected,
    setSelectedIds,
  };
}

export default useBatchSelection;
