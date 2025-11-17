# Batch Operations System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            BatchActionBar Component                      │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌──────┐  │   │
│  │  │Select  │ │ Delete │ │ Export │ │ Assign │ │ Undo │  │   │
│  │  │  All   │ │        │ │        │ │        │ │      │  │   │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └──────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Item List with Checkboxes                   │   │
│  │  ☑ Goal 1 (Shift+Click for range)                       │   │
│  │  ☑ Goal 2 (Ctrl+Click for toggle)                       │   │
│  │  ☐ Goal 3                                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        React Hooks Layer                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           useBatchSelection Hook                         │   │
│  │  • Manages selection state                               │   │
│  │  • Handles keyboard shortcuts                            │   │
│  │  • Provides selection utilities                          │   │
│  │  • Optional persistence to localStorage                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Batch Operations Engine                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Bulk Edit   │  │ Bulk Delete  │  │ Bulk Export  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Bulk Assign  │  │ Bulk Status  │  │Bulk Duplicate│         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           Operation History Manager                      │   │
│  │  • Stores operation snapshots                            │   │
│  │  • Enables undo/redo                                      │   │
│  │  • Maintains 50-operation history                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Data Layer                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   SUMRY Store                            │   │
│  │  • students[]                                             │   │
│  │  • goals[]                                                │   │
│  │  • logs[]                                                 │   │
│  │  • schedules[], accommodations[], etc.                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│                              ↕                                    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   localStorage                           │   │
│  │  • Persistent storage                                     │   │
│  │  • Automatic sync                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Component Interaction Flow

### 1. Selection Flow

```
User clicks item with modifier keys
           │
           ▼
useBatchSelection.handleSelect()
           │
           ├─ No modifier: Single select
           ├─ Shift: Range select (uses handleRangeSelection)
           └─ Ctrl/Cmd: Toggle select (uses handleToggleSelection)
           │
           ▼
Update selectedIds state
           │
           ▼
BatchActionBar re-renders with new count
```

### 2. Bulk Operation Flow

```
User clicks bulk action button
           │
           ▼
BatchActionBar checks confirmation level
           │
           ├─ NONE: Execute immediately
           ├─ SOFT: Show confirmation button
           └─ HARD: Show dialog
           │
           ▼
User confirms (if needed)
           │
           ▼
onBulkAction callback
           │
           ▼
Call batch operation function
  (bulkDelete, bulkEdit, etc.)
           │
           ├─ Create snapshot (for undo)
           ├─ Validate items (if validator provided)
           ├─ Apply operation to each item
           ├─ Collect successes/failures
           └─ Update operation history
           │
           ▼
Return { store: newStore, result }
           │
           ▼
Update app state with newStore
           │
           ▼
BatchActionBar shows result notification
           │
           ▼
Clear selection (if successful)
```

### 3. Undo Flow

```
User clicks Undo button
           │
           ▼
undoLastOperation(store)
           │
           ├─ Get last operation from history
           ├─ Retrieve snapshot
           └─ Restore store from snapshot
           │
           ▼
Return { store: restoredStore, result }
           │
           ▼
Update app state with restoredStore
           │
           ▼
Show success notification
```

## File Structure

```
/home/user/SUMRY/
│
├── src/
│   ├── lib/
│   │   ├── batchOperations.js          # Core engine (950+ lines)
│   │   │   ├── Operation functions
│   │   │   ├── History management
│   │   │   └── Selection utilities
│   │   └── __tests__/
│   │       └── batchOperations.test.js # Tests (450+ lines)
│   │
│   ├── hooks/
│   │   └── useBatchSelection.js         # Selection hook (320+ lines)
│   │
│   └── components/
│       └── batch/
│           ├── index.js                 # Main export
│           ├── BatchActionBar.jsx       # UI component (620+ lines)
│           ├── BatchOperationsDemo.jsx  # Demo components
│           ├── IntegrationExample.jsx   # Integration examples
│           ├── README.md                # Documentation
│           ├── QUICK_START.md           # Quick start guide
│           └── ARCHITECTURE.md          # This file
│
└── BATCH_OPERATIONS_SUMMARY.md          # Implementation summary
```

## Data Flow Diagram

```
┌──────────────┐
│     User     │
└──────┬───────┘
       │ Clicks item with Shift/Ctrl
       ▼
┌──────────────────────────┐
│  useBatchSelection Hook  │
│  ┌────────────────────┐  │
│  │ handleSelect()     │  │
│  │  ├─ Single select  │  │
│  │  ├─ Range select   │  │
│  │  └─ Toggle select  │  │
│  └────────────────────┘  │
│  ┌────────────────────┐  │
│  │ selectedIds state  │  │
│  └────────────────────┘  │
└──────┬───────────────────┘
       │ Updates
       ▼
┌──────────────────────────┐
│   BatchActionBar         │
│  ┌────────────────────┐  │
│  │ Shows count        │  │
│  │ Enables actions    │  │
│  └────────────────────┘  │
└──────┬───────────────────┘
       │ User clicks action
       ▼
┌──────────────────────────┐
│  Confirmation Dialog     │
│  (if required)           │
└──────┬───────────────────┘
       │ Confirmed
       ▼
┌──────────────────────────┐
│  Batch Operation Engine  │
│  ┌────────────────────┐  │
│  │ Create snapshot    │  │
│  │ Validate items     │  │
│  │ Apply changes      │  │
│  │ Record history     │  │
│  └────────────────────┘  │
└──────┬───────────────────┘
       │ Returns result
       ▼
┌──────────────────────────┐
│    Update Store          │
│  ┌────────────────────┐  │
│  │ setStore(newStore) │  │
│  └────────────────────┘  │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│   Show Result            │
│  ┌────────────────────┐  │
│  │ Success/Error msg  │  │
│  │ Clear selection    │  │
│  └────────────────────┘  │
└──────────────────────────┘
```

## Key Design Decisions

### 1. Snapshot-based Undo
- **Why**: Reliable, simple to implement, guaranteed consistency
- **Trade-off**: Memory usage (mitigated by 50-operation limit)
- **Alternative considered**: Command pattern (more complex, same result)

### 2. Non-transactional by Default
- **Why**: Better UX for partial failures (some items succeed)
- **Trade-off**: Need to communicate partial success
- **Solution**: Detailed result reporting with success/failure counts

### 3. Hook-based Selection Management
- **Why**: Reusable, testable, separation of concerns
- **Trade-off**: Additional abstraction layer
- **Benefit**: Easy to use in any component

### 4. Operation History Limit (50)
- **Why**: Prevent memory bloat
- **Trade-off**: Can't undo beyond 50 operations
- **Reasoning**: Users rarely need more than a few undos

### 5. Confirmation Levels
- **Why**: Balance safety and UX
- **NONE**: Fast operations (export)
- **SOFT**: Reversible operations (duplicate)
- **HARD**: Destructive operations (delete)

## State Management

```javascript
// Selection State (per view)
{
  selectedIds: string[],        // Currently selected item IDs
  lastSelectedId: string | null, // For range selection
  selectionMode: 'normal' | 'range' | 'toggle'
}

// Operation History (global)
{
  history: Operation[],          // Array of operations
  currentIndex: number           // Current position in history
}

// Operation Snapshot
{
  timestamp: string,             // When snapshot was created
  entityType: string,            // Type of entities
  entities: Object[],            // Affected entities
  allEntities: Object[]          // All entities (for restore)
}

// Operation Result
{
  success: boolean,              // Overall success
  totalItems: number,            // Total items processed
  successCount: number,          // Successful operations
  failureCount: number,          // Failed operations
  errors: Array<{id, error}>,    // Error details
  affectedIds: string[],         // IDs that were affected
  snapshot: Snapshot | null,     // Undo snapshot
  metadata: Object               // Additional data
}
```

## Performance Characteristics

- **Selection**: O(1) lookup, O(n) for range select
- **Bulk Operations**: O(n) where n = number of selected items
- **Undo**: O(1) to retrieve snapshot, O(n) to restore
- **Memory**: ~50 snapshots × average entity size
- **Tested**: 1000+ items with smooth performance

## Extension Points

### Adding a New Operation

```javascript
// 1. Add operation type constant
export const BATCH_OPERATION_TYPES = {
  // ... existing types
  CUSTOM_OPERATION: 'custom_operation',
};

// 2. Implement operation function
export function customOperation(store, entityType, ids, params, options) {
  const result = new BatchOperationResult();
  // ... implement logic
  return { store: newStore, result };
}

// 3. Add action to BatchActionBar
const actions = [
  {
    type: 'custom_operation',
    label: 'Custom Action',
    icon: MyIcon,
    confirmLevel: CONFIRMATION_LEVELS.SOFT,
  },
];

// 4. Handle in onBulkAction callback
case 'custom_operation':
  ({ store: newStore, result } = customOperation(
    store,
    entityType,
    selectedIds,
    params
  ));
  break;
```

### Adding a New Entity Type

```javascript
// 1. Add to ENTITY_TYPES
export const ENTITY_TYPES = {
  // ... existing types
  MY_ENTITY: 'myEntity',
};

// 2. Update CSV builder in bulkExport
case ENTITY_TYPES.MY_ENTITY:
  rows.push(['Header1', 'Header2']);
  entities.forEach(entity => {
    rows.push([entity.field1, entity.field2]);
  });
  break;

// 3. Add cascade logic in handleCascadeDelete (if needed)
case ENTITY_TYPES.MY_ENTITY:
  // Handle related entities
  break;
```

## Testing Strategy

1. **Unit Tests**: Test each operation independently
2. **Integration Tests**: Test operation + history
3. **Edge Cases**: Empty selections, invalid IDs, validation failures
4. **Performance Tests**: Large datasets (1000+ items)
5. **UI Tests**: User interactions, keyboard shortcuts

## Security Considerations

1. **Validation**: Always validate before destructive operations
2. **Confirmation**: Require explicit confirmation for destructive actions
3. **Logging**: Operation history provides audit trail
4. **Rollback**: Undo capability for recovery
5. **Sanitization**: Validate all user inputs (IDs, parameters)

## Future Enhancements

1. **Async Operations**: Support for operations that require API calls
2. **Progress Streaming**: Real-time progress updates
3. **Batch Scheduling**: Schedule operations for later
4. **Operation Templates**: Save common batch operations
5. **Advanced Filtering**: Filter before batch operation
6. **Batch Import**: Import and apply batch changes from CSV
7. **Redo Support**: Complete redo implementation
8. **Collaborative Features**: Multi-user batch operations
