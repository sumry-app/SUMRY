# SUMRY Drag & Drop System

A comprehensive, production-ready drag-and-drop system built with @dnd-kit for managing goals, students, and tasks in the SUMRY application.

## Features

- **Smooth Animations**: Fluid drag-and-drop with beautiful transitions
- **Touch Support**: Works seamlessly on touch devices
- **Keyboard Accessible**: Full keyboard navigation support
- **Multi-Select**: Drag multiple items at once
- **Visual Feedback**: Clear indicators for drag state and drop zones
- **Flexible Operations**: Support for move, copy, reorder, and assign operations
- **Undo/Redo**: Built-in history management
- **Responsive**: Works on all screen sizes

## Installation

The system uses `@dnd-kit` which is already installed:

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities @dnd-kit/modifiers
```

## Components

### 1. KanbanBoard

A full-featured Kanban board for managing goals across different statuses.

```jsx
import { KanbanBoard } from './components/dnd/KanbanBoard';

function MyComponent() {
  const [goals, setGoals] = useState([...]);

  const handleGoalUpdate = (updatedGoal) => {
    setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
  };

  return (
    <KanbanBoard
      goals={goals}
      onGoalUpdate={handleGoalUpdate}
      students={students}
      showSearch={true}
      showFilters={true}
    />
  );
}
```

**Props:**
- `goals`: Array of goal objects
- `onGoalUpdate`: Callback when a goal is updated
- `onGoalCreate`: Callback when a new goal is created
- `students`: Array of student objects (for filtering)
- `columns`: Custom column configuration (optional)
- `showSearch`: Show search bar (default: true)
- `showFilters`: Show filter options (default: true)

### 2. DraggableGoal

A draggable goal card with smooth animations and visual feedback.

```jsx
import { DraggableGoal } from './components/dnd/DraggableGoal';

function MyGoalList() {
  return (
    <DraggableGoal
      goal={goal}
      isSelected={false}
      onSelect={(id, ctrlKey, shiftKey) => handleSelect(id, ctrlKey, shiftKey)}
      showDragHandle={true}
    />
  );
}
```

**Props:**
- `goal`: Goal object to display
- `isSelected`: Whether the goal is selected (for multi-select)
- `onSelect`: Callback for selection
- `showDragHandle`: Show drag handle icon (default: true)
- `disabled`: Disable dragging (default: false)

**Variants:**
- `DraggableGoalOverlay`: Ghost element during drag
- `DraggableGoalPlaceholder`: Placeholder in original position
- `CompactDraggableGoal`: Compact version for dense lists

### 3. DroppableZone

Flexible drop zones with validation and visual feedback.

```jsx
import { DroppableZone } from './components/dnd/DroppableZone';

function MyDropZone() {
  return (
    <DroppableZone
      id="my-zone"
      acceptTypes={['goal', 'task']}
      allowedOperations={['move', 'copy']}
      validate={(dragData) => dragData.area === 'Math'}
      label="Math Goals"
      description="Drop math-related goals here"
    >
      {/* Your droppable content */}
    </DroppableZone>
  );
}
```

**Props:**
- `id`: Unique identifier for the zone
- `acceptTypes`: Array of accepted drag types
- `allowedOperations`: Array of allowed operations
- `validate`: Custom validation function
- `label`: Zone label
- `description`: Zone description
- `emptyState`: Custom empty state component
- `orientation`: 'vertical' or 'horizontal'

**Variants:**
- `SortableDropZone`: Drop zone with internal sorting
- `CategorizationZone`: Zone for categorizing items
- `AssignmentZone`: Zone for assigning items to entities

### 4. Utilities (`src/lib/dragAndDrop.js`)

Comprehensive utilities for drag-and-drop operations.

```jsx
import {
  useDndSensors,
  GOAL_STATUSES,
  DND_OPERATIONS,
  reorderArray,
  moveItemBetweenArrays,
  MultiSelectManager,
  DragUndoManager,
} from './lib/dragAndDrop';

// Use sensors
const sensors = useDndSensors();

// Reorder items
const newArray = reorderArray(items, oldIndex, newIndex);

// Move between arrays
const { source, destination } = moveItemBetweenArrays(
  sourceArray,
  destArray,
  sourceIndex,
  destIndex
);

// Multi-select
const multiSelect = new MultiSelectManager();
multiSelect.toggle('goal-1');
multiSelect.selectRange(items, 'goal-1', 'goal-5');

// Undo/Redo
const undoManager = new DragUndoManager();
undoManager.push(currentState);
const previousState = undoManager.undo();
```

## Usage Examples

### Basic Kanban Board

```jsx
import { KanbanBoard } from './components/dnd';
import { GOAL_STATUSES } from './lib/dragAndDrop';

function GoalManagement() {
  const [goals, setGoals] = useState([
    {
      id: '1',
      description: 'Improve reading',
      area: 'Reading',
      status: GOAL_STATUSES.ACTIVE,
      baseline: '40%',
      target: '80%',
    },
    // ... more goals
  ]);

  return (
    <KanbanBoard
      goals={goals}
      onGoalUpdate={(goal) => {
        setGoals(prev => prev.map(g => g.id === goal.id ? goal : g));
      }}
    />
  );
}
```

### Sortable List with Multi-Select

```jsx
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { DraggableGoal } from './components/dnd';
import { useDndSensors, MultiSelectManager } from './lib/dragAndDrop';

function SortableList() {
  const [items, setItems] = useState([...]);
  const [selected, setSelected] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const sensors = useDndSensors();
  const multiSelect = new MultiSelectManager();

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(e) => setActiveId(e.active.id)}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map(i => i.id)}>
        {items.map(item => (
          <DraggableGoal
            key={item.id}
            goal={item}
            isSelected={selected.includes(item.id)}
            onSelect={(id, ctrl) => {
              if (ctrl) {
                const newSelected = multiSelect.toggle(id);
                setSelected(newSelected);
              } else {
                setSelected([id]);
              }
            }}
          />
        ))}
      </SortableContext>
      <DragOverlay>
        {activeId && <DraggableGoal goal={items.find(i => i.id === activeId)} />}
      </DragOverlay>
    </DndContext>
  );
}
```

### Custom Drop Zones

```jsx
import { DroppableZone, AssignmentZone } from './components/dnd';

function StudentAssignment() {
  const [unassigned, setUnassigned] = useState([...]);
  const [students, setStudents] = useState([
    { id: 's1', name: 'John', goals: [] },
    { id: 's2', name: 'Jane', goals: [] },
  ]);

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Unassigned pool */}
      <DroppableZone
        id="unassigned"
        label="Unassigned Goals"
        acceptTypes={['goal']}
      >
        {unassigned.map(goal => (
          <DraggableGoal key={goal.id} goal={goal} />
        ))}
      </DroppableZone>

      {/* Student zones */}
      {students.map(student => (
        <AssignmentZone
          key={student.id}
          id={student.id}
          entity={student}
          items={student.goals}
          acceptTypes={['goal']}
        >
          {student.goals.map(goal => (
            <DraggableGoal key={goal.id} goal={goal} />
          ))}
        </AssignmentZone>
      ))}
    </div>
  );
}
```

## Keyboard Shortcuts

- **Arrow Keys**: Navigate between items
- **Space/Enter**: Pick up/drop item
- **Escape**: Cancel drag operation
- **Ctrl/Cmd + Click**: Multi-select items
- **Shift + Click**: Range select items

## Accessibility

The drag-and-drop system is fully accessible:

- Screen reader announcements for all drag operations
- Keyboard navigation support
- ARIA labels and roles
- Focus management
- High contrast mode support

## Customization

### Custom Columns

```jsx
const customColumns = [
  { id: 'todo', title: 'To Do', status: GOAL_STATUSES.BACKLOG },
  { id: 'doing', title: 'Doing', status: GOAL_STATUSES.IN_PROGRESS },
  { id: 'done', title: 'Done', status: GOAL_STATUSES.COMPLETED },
];

<KanbanBoard goals={goals} columns={customColumns} />
```

### Custom Validation

```jsx
<DroppableZone
  id="math-only"
  validate={(dragData) => {
    // Only accept math goals
    return dragData.goal?.area === 'Math';
  }}
/>
```

### Custom Styles

All components accept `className` props for custom styling:

```jsx
<DraggableGoal
  goal={goal}
  className="my-custom-class hover:shadow-xl"
/>
```

## Performance Tips

1. **Virtualization**: For large lists (100+ items), consider using react-virtual
2. **Memoization**: Wrap drag handlers with useCallback
3. **Lazy Loading**: Load goals on demand for large datasets
4. **Debounce Search**: Debounce search input to reduce re-renders

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile Safari: Full support with touch
- Mobile Chrome: Full support with touch

## Demo

See `DndDemo.jsx` for comprehensive examples of all features.

## API Reference

### Goal Status Constants

```javascript
GOAL_STATUSES.BACKLOG      // 'backlog'
GOAL_STATUSES.ACTIVE       // 'active'
GOAL_STATUSES.IN_PROGRESS  // 'in_progress'
GOAL_STATUSES.COMPLETED    // 'completed'
GOAL_STATUSES.ON_HOLD      // 'on_hold'
```

### DnD Operations

```javascript
DND_OPERATIONS.MOVE        // 'move' - Move item
DND_OPERATIONS.COPY        // 'copy' - Copy item
DND_OPERATIONS.REORDER     // 'reorder' - Reorder within list
DND_OPERATIONS.CATEGORIZE  // 'categorize' - Categorize item
DND_OPERATIONS.ASSIGN      // 'assign' - Assign to entity
```

### Utility Functions

```javascript
// Sensors
useDndSensors() // Returns configured sensors

// Array operations
reorderArray(array, fromIndex, toIndex)
moveItemBetweenArrays(source, dest, sourceIndex, destIndex)
copyItemBetweenArrays(source, dest, sourceIndex, destIndex)

// Validation
isValidDrop(dragData, dropData)

// Styling
getKanbanColumnStyles(status)
getStatusLabel(status)
getDragAnimationStyles(isDragging, transform)

// Accessibility
createDragAnnouncement(action, itemType, itemName)
```

## Troubleshooting

### Items not dragging

Ensure you've set up DndContext properly:

```jsx
<DndContext sensors={sensors} onDragEnd={handleDragEnd}>
  {/* Your content */}
</DndContext>
```

### Drop zones not accepting items

Check your `acceptTypes` and validation:

```jsx
<DroppableZone
  acceptTypes={['goal']} // Must match draggable type
  validate={(data) => {
    console.log('Validating:', data);
    return true;
  }}
/>
```

### Performance issues

- Use `React.memo()` for goal cards
- Implement virtualization for long lists
- Reduce re-renders with useCallback

## Contributing

When adding new drag-and-drop features:

1. Add utilities to `src/lib/dragAndDrop.js`
2. Create components in `src/components/dnd/`
3. Export from `src/components/dnd/index.js`
4. Add examples to `DndDemo.jsx`
5. Update this README

## License

Part of the SUMRY application.
