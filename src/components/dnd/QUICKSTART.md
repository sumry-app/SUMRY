# Drag & Drop Quick Start Guide

## 🎯 What's Included

A complete drag-and-drop system for SUMRY with:

✅ **Kanban Board** - Trello-like board for goal management
✅ **Sortable Lists** - Reorder items with drag and drop
✅ **Drop Zones** - Flexible zones for categorization and assignment
✅ **Touch Support** - Works on mobile and tablets
✅ **Keyboard Accessible** - Full keyboard navigation
✅ **Multi-Select** - Drag multiple items at once
✅ **Undo/Redo** - History management built-in

## 📦 Files Created

```
src/
├── lib/
│   └── dragAndDrop.js                    # Utilities and helpers
└── components/
    └── dnd/
        ├── index.js                       # Main exports
        ├── DraggableGoal.jsx             # Draggable goal cards
        ├── DroppableZone.jsx             # Drop zones
        ├── KanbanBoard.jsx               # Full kanban board
        ├── GoalKanbanIntegration.jsx     # Store integration
        ├── DndDemo.jsx                   # Interactive demos
        ├── README.md                     # Full documentation
        └── QUICKSTART.md                 # This file
```

## 🚀 Quick Start

### 1. Use the Full Kanban Board

The easiest way to get started is with the pre-integrated Kanban board:

```jsx
import { GoalKanbanIntegration } from './components/dnd/GoalKanbanIntegration';

function App() {
  return <GoalKanbanIntegration />;
}
```

That's it! The board is already connected to your Zustand store.

### 2. Use a Compact Widget

For dashboard widgets or smaller spaces:

```jsx
import { CompactGoalKanban } from './components/dnd/GoalKanbanIntegration';

function StudentDashboard({ studentId }) {
  return (
    <div className="h-96">
      <CompactGoalKanban studentId={studentId} />
    </div>
  );
}
```

### 3. Build Custom Drag & Drop

For custom implementations:

```jsx
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { DraggableGoal } from './components/dnd';
import { useDndSensors } from './lib/dragAndDrop';

function CustomDragDrop() {
  const sensors = useDndSensors();
  const [goals, setGoals] = useState([...]);
  const [activeGoal, setActiveGoal] = useState(null);

  const handleDragStart = (event) => {
    setActiveGoal(goals.find(g => g.id === event.active.id));
  };

  const handleDragEnd = (event) => {
    // Handle drop logic
    setActiveGoal(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={goals.map(g => g.id)}>
        {goals.map(goal => (
          <DraggableGoal key={goal.id} goal={goal} />
        ))}
      </SortableContext>

      <DragOverlay>
        {activeGoal && <DraggableGoal goal={activeGoal} />}
      </DragOverlay>
    </DndContext>
  );
}
```

## 📱 Features by Component

### KanbanBoard

```jsx
<KanbanBoard
  goals={goals}                    // Array of goals
  onGoalUpdate={handleUpdate}      // Called when goal moves
  onGoalCreate={handleCreate}      // Called when + clicked
  students={students}              // For filtering
  showSearch={true}                // Show search bar
  showFilters={true}               // Show filters
/>
```

**Features:**
- Drag goals between columns
- Search and filter
- Add new goals per column
- Auto-saves to store
- Responsive design

### DraggableGoal

```jsx
<DraggableGoal
  goal={goal}                      // Goal object
  isSelected={false}               // For multi-select
  onSelect={handleSelect}          // Selection callback
  showDragHandle={true}            // Show grip icon
/>
```

**Features:**
- Smooth drag animations
- Hover effects
- Drag handle
- Multi-select support
- Visual feedback

### DroppableZone

```jsx
<DroppableZone
  id="zone-1"
  acceptTypes={['goal']}           // What types to accept
  validate={(data) => true}        // Custom validation
  label="Drop Zone"
  emptyState={<div>Empty</div>}
>
  {/* Your content */}
</DroppableZone>
```

**Features:**
- Visual feedback on hover
- Type validation
- Custom validators
- Accept/reject states
- Empty states

## 🎨 Customization

### Custom Columns

```jsx
const customColumns = [
  { id: 'todo', title: 'To Do', status: 'backlog' },
  { id: 'doing', title: 'Doing', status: 'in_progress' },
  { id: 'done', title: 'Done', status: 'completed' },
];

<KanbanBoard goals={goals} columns={customColumns} />
```

### Custom Styles

```jsx
<DraggableGoal
  goal={goal}
  className="shadow-xl hover:scale-105 transition-transform"
/>
```

### Custom Validation

```jsx
<DroppableZone
  validate={(dragData) => {
    // Only accept math goals
    return dragData.goal?.area === 'Math';
  }}
/>
```

## 🎮 Interactive Demo

See all features in action:

```jsx
import { DndDemo } from './components/dnd/DndDemo';

function App() {
  return <DndDemo />;
}
```

The demo includes:
- Full Kanban board
- Sortable lists
- Categorization zones
- Assignment zones
- Multi-select examples

## ⌨️ Keyboard Shortcuts

- **Arrow Keys**: Navigate between items
- **Space/Enter**: Pick up/drop item
- **Escape**: Cancel drag
- **Ctrl/Cmd + Click**: Multi-select
- **Shift + Click**: Range select

## 📱 Touch Support

Works seamlessly on:
- iOS Safari
- Android Chrome
- iPad
- Android tablets

Touch activation:
- Hold for 250ms to start drag
- 5px tolerance for movement

## ♿ Accessibility

- Screen reader announcements
- Full keyboard navigation
- ARIA labels and roles
- Focus management
- High contrast support

## 🔧 Utilities

### Array Operations

```jsx
import { reorderArray, moveItemBetweenArrays } from './lib/dragAndDrop';

// Reorder within array
const newArray = reorderArray(items, oldIndex, newIndex);

// Move between arrays
const { source, destination } = moveItemBetweenArrays(
  sourceArray,
  destArray,
  sourceIndex,
  destIndex
);
```

### Multi-Select

```jsx
import { MultiSelectManager } from './lib/dragAndDrop';

const multiSelect = new MultiSelectManager();
multiSelect.toggle('goal-1');              // Toggle selection
multiSelect.select('goal-2');              // Select
multiSelect.deselect('goal-3');            // Deselect
multiSelect.selectRange(items, 'g1', 'g5'); // Range select
multiSelect.clear();                       // Clear all
```

### Undo/Redo

```jsx
import { DragUndoManager } from './lib/dragAndDrop';

const undoManager = new DragUndoManager();
undoManager.push(currentState);            // Save state
const prev = undoManager.undo();           // Undo
const next = undoManager.redo();           // Redo
const canUndo = undoManager.canUndo();     // Check if can undo
```

## 🎯 Status Constants

```jsx
import { GOAL_STATUSES } from './lib/dragAndDrop';

GOAL_STATUSES.BACKLOG      // 'backlog'
GOAL_STATUSES.ACTIVE       // 'active'
GOAL_STATUSES.IN_PROGRESS  // 'in_progress'
GOAL_STATUSES.COMPLETED    // 'completed'
GOAL_STATUSES.ON_HOLD      // 'on_hold'
```

## 📊 Example: Student Goal Board

```jsx
import { GoalKanbanIntegration } from './components/dnd/GoalKanbanIntegration';

function StudentGoals() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">
        Student Goals
      </h1>
      <GoalKanbanIntegration />
    </div>
  );
}
```

## 🐛 Troubleshooting

**Items not dragging?**
```jsx
// Make sure you have DndContext
<DndContext sensors={sensors} onDragEnd={handleDragEnd}>
  {/* Your content */}
</DndContext>
```

**Drop zones not working?**
```jsx
// Check acceptTypes matches drag type
<DroppableZone
  acceptTypes={['goal']}  // Must match draggable type
/>
```

**Performance issues?**
```jsx
// Use React.memo for goal cards
const MemoizedGoal = React.memo(DraggableGoal);

// Or use virtualization for 100+ items
import { useVirtual } from 'react-virtual';
```

## 📚 Next Steps

1. Read full documentation in `README.md`
2. Explore `DndDemo.jsx` for examples
3. Check `dragAndDrop.js` for all utilities
4. Customize components for your needs

## 💡 Tips

1. **Start Simple**: Use `GoalKanbanIntegration` first
2. **Customize Later**: Build custom once you understand the basics
3. **Test on Touch**: Always test on mobile devices
4. **Use Keyboard**: Test keyboard navigation
5. **Check Console**: Watch for validation errors

## 🎉 You're Ready!

The drag-and-drop system is production-ready and fully integrated with your SUMRY store. Start by using `GoalKanbanIntegration` and customize from there!

For questions or issues, see the full `README.md` or demo file `DndDemo.jsx`.
