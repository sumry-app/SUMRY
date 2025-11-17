/**
 * SUMRY Batch Operations - Main Export
 *
 * Central export file for all batch operations components and utilities.
 *
 * @module batch
 */

// Main components
export { BatchActionBar, ACTION_TYPES, CONFIRMATION_LEVELS } from './BatchActionBar';

// Demo/example components
export {
  GoalsBatchOperations,
  StudentsBatchOperations,
  LogsBatchOperations,
} from './BatchOperationsDemo';

// Integration examples
export {
  GoalsViewWithBatch,
  StudentsViewWithBatch,
  LogsViewWithBatch,
} from './IntegrationExample';

// Re-export batch operations library
export * from '@/lib/batchOperations';

// Re-export batch selection hook
export { useBatchSelection } from '@/hooks/useBatchSelection';

/**
 * Quick start guide:
 *
 * 1. Import the components:
 *    import { BatchActionBar, useBatchSelection } from '@/components/batch';
 *
 * 2. Use the hook to manage selection:
 *    const { selectedIds, handleSelect, isSelected } = useBatchSelection(allIds);
 *
 * 3. Add the action bar:
 *    <BatchActionBar
 *      selectedIds={selectedIds}
 *      allIds={allIds}
 *      onSelectionChange={setSelection}
 *      entityType="goals"
 *      actions={actions}
 *      onBulkAction={handleBulkAction}
 *    />
 *
 * 4. Add checkboxes to your items:
 *    <Checkbox
 *      checked={isSelected(item.id)}
 *      onClick={(e) => handleSelect(item.id, e)}
 *    />
 *
 * See README.md for complete documentation.
 */
