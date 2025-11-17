# SUMRY Batch Operations System

A comprehensive batch operations system for SUMRY that enables powerful multi-select and bulk actions across all entity types.

## Features

### Core Functionality
- **Multi-select with checkboxes** - Select multiple items for batch operations
- **Keyboard shortcuts** - Shift+Click for range select, Ctrl/Cmd+Click for toggle
- **Bulk operations** - Edit, delete, export, assign, duplicate, and more
- **Transaction support** - All-or-nothing operations with rollback
- **Undo/redo** - Comprehensive undo system with operation history
- **Progress indicators** - Real-time feedback during operations
- **Error handling** - Graceful handling of partial failures
- **Confirmation dialogs** - Safe destructive operations with explicit confirmations

### Supported Operations

#### 1. Bulk Edit
Update multiple items with the same changes.

```javascript
import { bulkEdit, ENTITY_TYPES } from '@/lib/batchOperations';

const { store: newStore, result } = bulkEdit(
  store,
  ENTITY_TYPES.GOALS,
  selectedIds,
  { status: 'completed' },
  { transactional: true }
);
```

#### 2. Bulk Delete
Remove multiple items with optional cascade deletion.

```javascript
import { bulkDelete, ENTITY_TYPES } from '@/lib/batchOperations';

const { store: newStore, result } = bulkDelete(
  store,
  ENTITY_TYPES.STUDENTS,
  selectedIds,
  { cascade: true } // Deletes related goals and logs
);
```

#### 3. Bulk Export
Export selected items to CSV.

```javascript
import { bulkExport, ENTITY_TYPES } from '@/lib/batchOperations';

const { store, result } = bulkExport(
  store,
  ENTITY_TYPES.GOALS,
  selectedIds,
  { filename: 'goals-export.csv' }
);
```

#### 4. Bulk Assign
Assign multiple items to a target (student, cohort, teacher, etc.).

```javascript
import { bulkAssign, ENTITY_TYPES } from '@/lib/batchOperations';

const { store: newStore, result } = bulkAssign(
  store,
  ENTITY_TYPES.STUDENTS,
  selectedIds,
  {
    assignmentType: 'cohort',
    value: 'cohort-a'
  }
);
```

#### 5. Bulk Status Change
Change the status of multiple items.

```javascript
import { bulkStatusChange, ENTITY_TYPES } from '@/lib/batchOperations';

const { store: newStore, result } = bulkStatusChange(
  store,
  ENTITY_TYPES.GOALS,
  selectedIds,
  'archived'
);
```

#### 6. Bulk Duplicate
Create copies of selected items.

```javascript
import { bulkDuplicate, ENTITY_TYPES } from '@/lib/batchOperations';

const { store: newStore, result } = bulkDuplicate(
  store,
  ENTITY_TYPES.GOALS,
  selectedIds,
  {
    transform: (duplicate, original) => {
      duplicate.createdBy = currentUserId;
    }
  }
);
```

## Components

### BatchActionBar

The main UI component for batch operations.

```jsx
import { BatchActionBar, ACTION_TYPES, CONFIRMATION_LEVELS } from '@/components/batch/BatchActionBar';

function MyComponent() {
  const [selectedIds, setSelectedIds] = useState([]);

  const actions = [
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

  const handleBulkAction = async ({ actionType, selectedIds, params }) => {
    // Handle the action
    return { success: true, successCount: selectedIds.length };
  };

  return (
    <BatchActionBar
      selectedIds={selectedIds}
      allIds={allIds}
      onSelectionChange={setSelectedIds}
      entityType="goals"
      entityTypeSingular="goal"
      actions={actions}
      onBulkAction={handleBulkAction}
      onUndo={handleUndo}
      canUndo={canUndo()}
    />
  );
}
```

### useBatchSelection Hook

A custom hook for managing selection state with keyboard shortcuts.

```jsx
import { useBatchSelection } from '@/hooks/useBatchSelection';

function MyComponent({ items }) {
  const {
    selectedIds,
    selectedCount,
    handleSelect,
    selectAll,
    deselectAll,
    isSelected,
  } = useBatchSelection(items.map(i => i.id), {
    enableKeyboardShortcuts: true,
    maxSelection: 100,
  });

  return (
    <div>
      {items.map(item => (
        <div
          key={item.id}
          onClick={(e) => handleSelect(item.id, e)}
          className={isSelected(item.id) ? 'selected' : ''}
        >
          {item.name}
        </div>
      ))}
    </div>
  );
}
```

## Integration Guide

### Step 1: Add BatchActionBar to Your View

```jsx
import { BatchActionBar } from '@/components/batch/BatchActionBar';
import { useBatchSelection } from '@/hooks/useBatchSelection';

function GoalsView({ store, setStore, goals }) {
  const goalIds = goals.map(g => g.id);

  const {
    selectedIds,
    handleSelect,
    isSelected,
  } = useBatchSelection(goalIds);

  const handleBulkAction = async ({ actionType, selectedIds, params }) => {
    // Implement your bulk action logic here
    const { store: newStore, result } = bulkDelete(
      store,
      ENTITY_TYPES.GOALS,
      selectedIds
    );

    if (result.success || result.successCount > 0) {
      setStore(newStore);
    }

    return result;
  };

  return (
    <div>
      <BatchActionBar
        selectedIds={selectedIds}
        allIds={goalIds}
        onSelectionChange={(ids) => {}}
        entityType="goals"
        entityTypeSingular="goal"
        actions={goalActions}
        onBulkAction={handleBulkAction}
      />

      {goals.map(goal => (
        <GoalCard
          key={goal.id}
          goal={goal}
          isSelected={isSelected(goal.id)}
          onSelect={(e) => handleSelect(goal.id, e)}
        />
      ))}
    </div>
  );
}
```

### Step 2: Add Checkboxes to Your Items

```jsx
import { Checkbox } from '@/components/ui/checkbox';

function GoalCard({ goal, isSelected, onSelect }) {
  return (
    <Card
      className={isSelected ? 'ring-2 ring-blue-500' : ''}
      onClick={onSelect}
    >
      <CardContent className="flex items-start gap-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => {}}
          onClick={(e) => e.stopPropagation()}
        />
        <div className="flex-1">
          {/* Goal content */}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Step 3: Implement Undo/Redo

```jsx
import { undoLastOperation, canUndo } from '@/lib/batchOperations';

function MyComponent({ store, setStore }) {
  const handleUndo = useCallback(() => {
    const { store: restoredStore, result } = undoLastOperation(store);
    if (result.success) {
      setStore(restoredStore);
    }
  }, [store, setStore]);

  return (
    <BatchActionBar
      // ... other props
      onUndo={handleUndo}
      canUndo={canUndo()}
    />
  );
}
```

## Keyboard Shortcuts

- **Ctrl/Cmd + A** - Select all items
- **Escape** - Deselect all items
- **Ctrl/Cmd + I** - Invert selection
- **Shift + Click** - Range select (from last selected to clicked item)
- **Ctrl/Cmd + Click** - Toggle individual item selection

## Safety Features

### Transaction Support
Operations can be run in transactional mode where all changes are rolled back if any item fails:

```javascript
bulkEdit(store, entityType, ids, updates, { transactional: true });
```

### Cascade Deletion
When deleting students, optionally delete all related goals and logs:

```javascript
bulkDelete(store, ENTITY_TYPES.STUDENTS, ids, { cascade: true });
```

### Confirmation Levels
Three levels of confirmation for destructive actions:

1. **NONE** - No confirmation required
2. **SOFT** - Simple confirmation button
3. **HARD** - Dialog with explicit confirmation

### Operation History
All operations are tracked in history with snapshot support:

```javascript
import { undoLastOperation, getLastOperation } from '@/lib/batchOperations';

// Undo the last operation
const { store: restoredStore, result } = undoLastOperation(store);

// Get info about last operation
const lastOp = getLastOperation();
console.log(lastOp.type, lastOp.result);
```

## Entity Types

The following entity types are supported:

- `ENTITY_TYPES.STUDENTS` - Student records
- `ENTITY_TYPES.GOALS` - IEP goals
- `ENTITY_TYPES.LOGS` - Progress logs
- `ENTITY_TYPES.SCHEDULES` - Schedules
- `ENTITY_TYPES.ACCOMMODATIONS` - Accommodations
- `ENTITY_TYPES.BEHAVIOR_LOGS` - Behavior logs
- `ENTITY_TYPES.PRESENT_LEVELS` - Present levels
- `ENTITY_TYPES.SERVICE_LOGS` - Service logs

## Examples

See the following files for complete examples:

- `/src/components/batch/BatchOperationsDemo.jsx` - Complete examples for goals, students, and logs
- `/src/components/batch/BatchActionBar.jsx` - The main UI component
- `/src/lib/batchOperations.js` - The core engine
- `/src/hooks/useBatchSelection.js` - Selection state management hook

## Error Handling

The batch operations system includes comprehensive error handling:

```javascript
const { store: newStore, result } = bulkDelete(store, entityType, ids);

if (result.success) {
  console.log(`Successfully processed ${result.successCount} items`);
} else if (result.isPartialSuccess()) {
  console.log(`Partial success: ${result.successCount}/${result.totalItems}`);
  console.log('Errors:', result.errors);
} else {
  console.log('Operation failed:', result.errors);
}
```

## Best Practices

1. **Always use transactions for critical operations** - Ensures data consistency
2. **Provide clear confirmation dialogs for destructive actions** - Use HARD confirmation level
3. **Show progress indicators for long-running operations** - Better user experience
4. **Enable undo for all batch operations** - Allows users to recover from mistakes
5. **Validate data before bulk operations** - Use the `validate` option
6. **Use cascade deletion carefully** - Ensure users understand what will be deleted

## API Reference

See the JSDoc comments in `/src/lib/batchOperations.js` for complete API documentation.

## License

Part of the SUMRY application.
