import React from 'react';
import { KanbanBoard } from './KanbanBoard';
import { useDataStore } from '../../store/dataStore';
import { GOAL_STATUSES } from '../../lib/dragAndDrop';

/**
 * GoalKanbanIntegration Component
 * Integrates the Kanban board with the SUMRY Zustand store
 *
 * Usage:
 * import { GoalKanbanIntegration } from './components/dnd/GoalKanbanIntegration';
 *
 * function MyPage() {
 *   return <GoalKanbanIntegration />;
 * }
 */
export function GoalKanbanIntegration() {
  const goals = useDataStore((state) => state.goals);
  const students = useDataStore((state) => state.students);
  const updateGoal = useDataStore((state) => state.updateGoal);
  const createGoal = useDataStore((state) => state.createGoal);
  const deleteGoal = useDataStore((state) => state.deleteGoal);

  // Handle goal updates (including status changes from drag-and-drop)
  const handleGoalUpdate = async (updatedGoal) => {
    try {
      await updateGoal(updatedGoal.id, updatedGoal);
    } catch (error) {
      console.error('Failed to update goal:', error);
    }
  };

  // Handle new goal creation
  const handleGoalCreate = async ({ status }) => {
    const newGoal = {
      student_id: students[0]?.id || null, // Default to first student
      area: 'General',
      description: 'New Goal - Click to edit',
      baseline: '',
      target: '',
      metric: '',
      status: status || GOAL_STATUSES.BACKLOG,
    };

    try {
      await createGoal(newGoal);
    } catch (error) {
      console.error('Failed to create goal:', error);
    }
  };

  // Handle goal deletion
  const handleGoalDelete = async (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await deleteGoal(goalId);
      } catch (error) {
        console.error('Failed to delete goal:', error);
      }
    }
  };

  return (
    <div className="h-screen p-6 bg-gray-50">
      <KanbanBoard
        goals={goals}
        students={students}
        onGoalUpdate={handleGoalUpdate}
        onGoalCreate={handleGoalCreate}
        onGoalDelete={handleGoalDelete}
        showSearch={true}
        showFilters={true}
      />
    </div>
  );
}

/**
 * CompactGoalKanban Component
 * A more compact version for dashboard widgets
 */
export function CompactGoalKanban({ studentId = null }) {
  const goals = useDataStore((state) =>
    studentId
      ? state.goals.filter(g => g.student_id === studentId)
      : state.goals
  );
  const updateGoal = useDataStore((state) => state.updateGoal);

  const handleGoalUpdate = async (updatedGoal) => {
    try {
      await updateGoal(updatedGoal.id, updatedGoal);
    } catch (error) {
      console.error('Failed to update goal:', error);
    }
  };

  return (
    <div className="h-full">
      <KanbanBoard
        goals={goals}
        onGoalUpdate={handleGoalUpdate}
        showSearch={false}
        showFilters={false}
        columns={[
          { id: GOAL_STATUSES.ACTIVE, title: 'Active', status: GOAL_STATUSES.ACTIVE },
          { id: GOAL_STATUSES.IN_PROGRESS, title: 'In Progress', status: GOAL_STATUSES.IN_PROGRESS },
          { id: GOAL_STATUSES.COMPLETED, title: 'Completed', status: GOAL_STATUSES.COMPLETED },
        ]}
      />
    </div>
  );
}

export default GoalKanbanIntegration;
