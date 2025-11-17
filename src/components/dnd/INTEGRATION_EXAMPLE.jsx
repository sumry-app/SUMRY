/**
 * INTEGRATION EXAMPLE
 *
 * This file shows how to integrate the drag-and-drop Kanban board
 * into existing SUMRY pages. Copy these patterns to add drag-and-drop
 * to your pages.
 */

import React from 'react';
import { GoalKanbanIntegration, CompactGoalKanban } from './GoalKanbanIntegration';
import { DraggableGoal, KanbanBoard } from './index';
import { useDataStore } from '../../store/dataStore';

// ============================================================================
// EXAMPLE 1: Full Page Kanban Board
// ============================================================================

/**
 * Full page dedicated to goal management with Kanban board
 * Perfect for: Main goal management page
 */
export function GoalManagementPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <GoalKanbanIntegration />
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: Dashboard Widget
// ============================================================================

/**
 * Compact Kanban board as a dashboard widget
 * Perfect for: Student dashboard, overview pages
 */
export function StudentDashboardWidget({ studentId }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">My Goals</h2>
      <div className="h-96">
        <CompactGoalKanban studentId={studentId} />
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: Custom Kanban with Custom Columns
// ============================================================================

/**
 * Custom Kanban board with your own column configuration
 * Perfect for: Custom workflows, different statuses
 */
export function CustomWorkflowBoard() {
  const goals = useDataStore((state) => state.goals);
  const updateGoal = useDataStore((state) => state.updateGoal);

  // Define custom columns
  const customColumns = [
    { id: 'planning', title: 'Planning', status: 'backlog' },
    { id: 'working', title: 'Working On It', status: 'in_progress' },
    { id: 'review', title: 'Under Review', status: 'on_hold' },
    { id: 'done', title: 'Completed', status: 'completed' },
  ];

  const handleGoalUpdate = async (updatedGoal) => {
    try {
      await updateGoal(updatedGoal.id, updatedGoal);
    } catch (error) {
      console.error('Failed to update goal:', error);
    }
  };

  return (
    <div className="h-screen p-6">
      <KanbanBoard
        goals={goals}
        columns={customColumns}
        onGoalUpdate={handleGoalUpdate}
        showSearch={true}
        showFilters={true}
      />
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: Sortable Goal List (Simple)
// ============================================================================

/**
 * Simple sortable list of goals (no kanban columns)
 * Perfect for: Prioritization, simple reordering
 */
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useDndSensors } from '../../lib/dragAndDrop';

export function SortableGoalList({ studentId }) {
  const [goals, setGoals] = React.useState([]);
  const [activeGoal, setActiveGoal] = React.useState(null);
  const sensors = useDndSensors();

  const handleDragStart = (event) => {
    const goal = goals.find(g => g.id === event.active.id);
    setActiveGoal(goal);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveGoal(null);

    if (over && active.id !== over.id) {
      setGoals((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Prioritize Goals</h2>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={goals.map(g => g.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {goals.map((goal, index) => (
              <div key={goal.id} className="flex items-center gap-3">
                <div className="text-sm text-gray-500 font-semibold w-8">
                  #{index + 1}
                </div>
                <div className="flex-1">
                  <DraggableGoal goal={goal} />
                </div>
              </div>
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeGoal && <DraggableGoal goal={activeGoal} />}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: Student-Specific Kanban
// ============================================================================

/**
 * Kanban board filtered for a specific student
 * Perfect for: Student profile pages, IEP meetings
 */
export function StudentKanbanBoard({ studentId, studentName }) {
  const allGoals = useDataStore((state) => state.goals);
  const updateGoal = useDataStore((state) => state.updateGoal);
  const createGoal = useDataStore((state) => state.createGoal);

  // Filter goals for this student
  const studentGoals = React.useMemo(
    () => allGoals.filter(g => g.student_id === studentId),
    [allGoals, studentId]
  );

  const handleGoalUpdate = async (updatedGoal) => {
    await updateGoal(updatedGoal.id, updatedGoal);
  };

  const handleGoalCreate = async ({ status }) => {
    await createGoal({
      student_id: studentId,
      area: 'General',
      description: 'New Goal',
      status,
    });
  };

  return (
    <div className="h-full">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{studentName}'s Goals</h1>
        <p className="text-gray-600">Manage and track progress</p>
      </div>

      <KanbanBoard
        goals={studentGoals}
        onGoalUpdate={handleGoalUpdate}
        onGoalCreate={handleGoalCreate}
        showSearch={false}  // No need for search on student page
        showFilters={false} // No need for student filter
      />
    </div>
  );
}

// ============================================================================
// EXAMPLE 6: Sidebar Widget
// ============================================================================

/**
 * Compact sidebar widget showing active goals
 * Perfect for: Sidebars, quick views
 */
export function ActiveGoalsSidebar({ studentId }) {
  const goals = useDataStore((state) =>
    state.goals.filter(g =>
      g.student_id === studentId &&
      (g.status === 'active' || g.status === 'in_progress')
    )
  );

  return (
    <div className="w-80 bg-white border-l p-4">
      <h3 className="font-semibold mb-3">Active Goals</h3>
      <div className="space-y-2">
        {goals.slice(0, 5).map(goal => (
          <div key={goal.id} className="text-sm p-2 bg-gray-50 rounded">
            <div className="font-medium">{goal.description}</div>
            <div className="text-xs text-gray-500">{goal.area}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 7: Modal/Dialog Integration
// ============================================================================

/**
 * Kanban board inside a modal dialog
 * Perfect for: Quick goal management from any page
 */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';

export function GoalManagementModal({ isOpen, onClose, studentId }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh]">
        <DialogHeader>
          <DialogTitle>Manage Goals</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <CompactGoalKanban studentId={studentId} />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// EXAMPLE 8: Tab Integration
// ============================================================================

/**
 * Kanban board as one tab in a tabbed interface
 * Perfect for: Student profiles, multi-view pages
 */
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export function StudentProfileTabs({ studentId }) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="goals">Goals Board</TabsTrigger>
        <TabsTrigger value="progress">Progress</TabsTrigger>
        <TabsTrigger value="notes">Notes</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <div>Student overview content...</div>
      </TabsContent>

      <TabsContent value="goals" className="h-[600px]">
        <CompactGoalKanban studentId={studentId} />
      </TabsContent>

      <TabsContent value="progress">
        <div>Progress charts...</div>
      </TabsContent>

      <TabsContent value="notes">
        <div>Notes content...</div>
      </TabsContent>
    </Tabs>
  );
}

// ============================================================================
// USAGE TIPS
// ============================================================================

/*

1. FULL PAGE KANBAN:
   - Use GoalKanbanIntegration for a complete solution
   - No configuration needed, works out of the box
   - Perfect for dedicated goal management pages

2. WIDGET/DASHBOARD:
   - Use CompactGoalKanban for smaller spaces
   - Pass studentId to filter by student
   - Great for dashboards and sidebars

3. CUSTOM IMPLEMENTATION:
   - Use KanbanBoard component directly
   - Pass custom columns for different workflows
   - Full control over behavior and styling

4. SIMPLE SORTING:
   - Use DndContext + SortableContext + DraggableGoal
   - Perfect for prioritization without columns
   - Simpler than full kanban

5. STYLING:
   - All components accept className prop
   - Use Tailwind classes for customization
   - Override default styles as needed

6. PERFORMANCE:
   - Filter goals before passing to board
   - Use React.useMemo for filtered data
   - Keep goal lists under 100 items per column

7. ERROR HANDLING:
   - All store operations are async
   - Use try/catch for error handling
   - Show user feedback on errors

8. ACCESSIBILITY:
   - Keyboard navigation works automatically
   - Screen readers supported
   - Test with keyboard only

*/

export default GoalManagementPage;
