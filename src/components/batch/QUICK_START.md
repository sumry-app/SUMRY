# Batch Operations Quick Start Guide

Get batch operations working in your SUMRY views in 5 minutes.

## 1. Import the Components

```javascript
import { BatchActionBar, useBatchSelection } from '@/components/batch';
import { bulkDelete, bulkExport, ENTITY_TYPES } from '@/lib/batchOperations';
import { Checkbox } from '@/components/ui/checkbox';
```

## 2. Add Selection State

```javascript
function MyGoalsView({ store, setStore, goals }) {
  // Get all goal IDs
  const goalIds = goals.map(g => g.id);

  // Use the batch selection hook
  const {
    selectedIds,
    handleSelect,
    isSelected,
  } = useBatchSelection(goalIds);

  // ... rest of component
}
```

## 3. Define Actions

```javascript
const actions = [
  {
    type: 'delete',
    label: 'Delete',
    destructive: true,
    confirmLevel: 'hard',
  },
  {
    type: 'export',
    label: 'Export',
    confirmLevel: 'none',
  },
];
```

## 4. Handle Bulk Actions

```javascript
const handleBulkAction = async ({ actionType, selectedIds }) => {
  let result;

  switch (actionType) {
    case 'delete':
      const { store: newStore, result } = bulkDelete(
        store,
        ENTITY_TYPES.GOALS,
        selectedIds,
        { cascade: true }
      );
      if (result.success || result.successCount > 0) {
        setStore(newStore);
      }
      return result;

    case 'export':
      ({ result } = bulkExport(
        store,
        ENTITY_TYPES.GOALS,
        selectedIds
      ));
      return result;
  }
};
```

## 5. Add the Action Bar

```javascript
return (
  <div>
    <BatchActionBar
      selectedIds={selectedIds}
      allIds={goalIds}
      onSelectionChange={() => {}}
      entityType="goals"
      entityTypeSingular="goal"
      actions={actions}
      onBulkAction={handleBulkAction}
    />

    {/* Your items below */}
  </div>
);
```

## 6. Add Checkboxes to Items

```javascript
{goals.map(goal => (
  <Card
    key={goal.id}
    className={isSelected(goal.id) ? 'ring-2 ring-blue-500' : ''}
    onClick={(e) => handleSelect(goal.id, e)}
  >
    <CardContent className="flex gap-3">
      <Checkbox
        checked={isSelected(goal.id)}
        onClick={(e) => e.stopPropagation()}
      />
      <div>
        {/* Goal content */}
      </div>
    </CardContent>
  </Card>
))}
```

## Done!

Your view now has:
- ✅ Multi-select with checkboxes
- ✅ Shift+Click range selection
- ✅ Ctrl/Cmd+Click toggle selection
- ✅ Bulk delete with confirmation
- ✅ Bulk export to CSV
- ✅ Visual feedback
- ✅ Error handling

## Full Example

Here's a complete, working example:

```javascript
import React from 'react';
import { BatchActionBar, useBatchSelection } from '@/components/batch';
import { bulkDelete, bulkExport, ENTITY_TYPES } from '@/lib/batchOperations';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function GoalsView({ store, setStore, goals, students }) {
  const goalIds = goals.map(g => g.id);
  const { selectedIds, handleSelect, isSelected } = useBatchSelection(goalIds);

  const handleBulkAction = async ({ actionType, selectedIds }) => {
    let newStore, result;

    if (actionType === 'delete') {
      ({ store: newStore, result } = bulkDelete(
        store,
        ENTITY_TYPES.GOALS,
        selectedIds,
        { cascade: true }
      ));
    } else if (actionType === 'export') {
      ({ store: newStore, result } = bulkExport(
        store,
        ENTITY_TYPES.GOALS,
        selectedIds
      ));
    }

    if (result.success || result.successCount > 0) {
      setStore(newStore);
    }

    return result;
  };

  const actions = [
    {
      type: 'delete',
      label: 'Delete',
      destructive: true,
      confirmLevel: 'hard',
    },
    {
      type: 'export',
      label: 'Export',
      confirmLevel: 'none',
    },
  ];

  return (
    <div className="space-y-4">
      <BatchActionBar
        selectedIds={selectedIds}
        allIds={goalIds}
        onSelectionChange={() => {}}
        entityType="goals"
        entityTypeSingular="goal"
        actions={actions}
        onBulkAction={handleBulkAction}
      />

      <div className="space-y-2">
        {goals.map(goal => {
          const student = students.find(s => s.id === goal.studentId);
          const selected = isSelected(goal.id);

          return (
            <Card
              key={goal.id}
              className={`cursor-pointer ${
                selected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
              }`}
              onClick={(e) => handleSelect(goal.id, e)}
            >
              <CardContent className="flex items-start gap-3 p-4">
                <Checkbox
                  checked={selected}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge>{goal.area}</Badge>
                    {student && (
                      <span className="text-sm text-gray-600">{student.name}</span>
                    )}
                  </div>
                  <p className="text-sm font-medium">{goal.description}</p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>Baseline: {goal.baseline}</span>
                    <span>Target: {goal.target}</span>
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
```

## Copy-Paste Ready Templates

For even faster integration, see:
- `/src/components/batch/IntegrationExample.jsx` - Complete examples for Goals, Students, and Logs
- Just copy the relevant view and paste into your App.jsx

## Keyboard Shortcuts

Your users can now:
- **Ctrl/Cmd + A** - Select all
- **Escape** - Deselect all
- **Shift + Click** - Range select
- **Ctrl/Cmd + Click** - Toggle select

## Next Steps

1. Try the basic example above
2. Review `/src/components/batch/IntegrationExample.jsx` for more advanced examples
3. Check `/src/components/batch/README.md` for complete documentation
4. Add more actions (duplicate, assign, status change) as needed

## Need Help?

- See `README.md` for detailed documentation
- See `IntegrationExample.jsx` for complete examples
- Run tests: `npm test src/lib/__tests__/batchOperations.test.js`
