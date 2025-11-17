import React, { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { Plus, MoreVertical, Filter, Search } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { DraggableGoal, DraggableGoalOverlay } from './DraggableGoal';
import { SortableDropZone, EmptyDropZone } from './DroppableZone';
import {
  GOAL_STATUSES,
  getStatusLabel,
  getKanbanColumnStyles,
  useDndSensors,
} from '../../lib/dragAndDrop';

/**
 * KanbanBoard Component
 * A beautiful, responsive Kanban board for managing goals
 */
export function KanbanBoard({
  goals = [],
  onGoalUpdate = null,
  onGoalCreate = null,
  onGoalDelete = null,
  columns = null,
  students = [],
  showSearch = true,
  showFilters = true,
  className = '',
}) {
  // Default columns if not provided
  const defaultColumns = [
    { id: GOAL_STATUSES.BACKLOG, title: 'Backlog', status: GOAL_STATUSES.BACKLOG },
    { id: GOAL_STATUSES.ACTIVE, title: 'Active', status: GOAL_STATUSES.ACTIVE },
    { id: GOAL_STATUSES.IN_PROGRESS, title: 'In Progress', status: GOAL_STATUSES.IN_PROGRESS },
    { id: GOAL_STATUSES.COMPLETED, title: 'Completed', status: GOAL_STATUSES.COMPLETED },
  ];

  const kanbanColumns = columns || defaultColumns;

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeGoal, setActiveGoal] = useState(null);
  const [goalsByStatus, setGoalsByStatus] = useState(() => {
    // Initialize goals by status
    const grouped = {};
    kanbanColumns.forEach(col => {
      grouped[col.status] = goals.filter(g => g.status === col.status || (!g.status && col.status === GOAL_STATUSES.BACKLOG));
    });
    return grouped;
  });

  // Update goals when prop changes
  React.useEffect(() => {
    const grouped = {};
    kanbanColumns.forEach(col => {
      grouped[col.status] = goals.filter(g => g.status === col.status || (!g.status && col.status === GOAL_STATUSES.BACKLOG));
    });
    setGoalsByStatus(grouped);
  }, [goals, kanbanColumns]);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Filter goals by search and student
  const filteredGoalsByStatus = useMemo(() => {
    const filtered = {};

    kanbanColumns.forEach(col => {
      let columnGoals = goalsByStatus[col.status] || [];

      // Apply search filter
      if (searchTerm) {
        columnGoals = columnGoals.filter(
          g =>
            g.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            g.area?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply student filter
      if (selectedStudent) {
        columnGoals = columnGoals.filter(g => g.studentId === selectedStudent);
      }

      filtered[col.status] = columnGoals;
    });

    return filtered;
  }, [goalsByStatus, searchTerm, selectedStudent, kanbanColumns]);

  // Handle drag start
  const handleDragStart = (event) => {
    const { active } = event;
    const goal = goals.find(g => g.id === active.id);
    setActiveGoal(goal);
  };

  // Handle drag over (for live feedback)
  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // Find the containers
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId) || overId;

    if (!activeContainer || !overContainer) return;

    if (activeContainer !== overContainer) {
      setGoalsByStatus(prev => {
        const activeItems = prev[activeContainer];
        const overItems = prev[overContainer] || [];

        const activeIndex = activeItems.findIndex(item => item.id === activeId);
        const overIndex = overItems.findIndex(item => item.id === overId);

        let newIndex;
        if (overId in prev) {
          newIndex = overItems.length + 1;
        } else {
          const isBelowOverItem =
            over &&
            active.rect.current.translated &&
            active.rect.current.translated.top > over.rect.top + over.rect.height;

          const modifier = isBelowOverItem ? 1 : 0;
          newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
        }

        return {
          ...prev,
          [activeContainer]: activeItems.filter(item => item.id !== activeId),
          [overContainer]: [
            ...overItems.slice(0, newIndex),
            activeItems[activeIndex],
            ...overItems.slice(newIndex),
          ],
        };
      });
    }
  };

  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveGoal(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId) || overId;

    if (!activeContainer || !overContainer) return;

    const activeIndex = goalsByStatus[activeContainer].findIndex(item => item.id === activeId);
    const overIndex = goalsByStatus[overContainer].findIndex(item => item.id === overId);

    if (activeContainer === overContainer) {
      // Reordering within the same column
      setGoalsByStatus(prev => ({
        ...prev,
        [activeContainer]: arrayMove(prev[activeContainer], activeIndex, overIndex),
      }));
    } else {
      // Moving between columns
      const updatedGoal = {
        ...goalsByStatus[activeContainer][activeIndex],
        status: overContainer,
      };

      // Update via callback
      if (onGoalUpdate) {
        onGoalUpdate(updatedGoal);
      }

      setGoalsByStatus(prev => {
        const activeItems = [...prev[activeContainer]];
        const overItems = [...(prev[overContainer] || [])];

        const [removed] = activeItems.splice(activeIndex, 1);
        const updatedItem = { ...removed, status: overContainer };

        let newOverIndex = overIndex >= 0 ? overIndex : overItems.length;
        overItems.splice(newOverIndex, 0, updatedItem);

        return {
          ...prev,
          [activeContainer]: activeItems,
          [overContainer]: overItems,
        };
      });
    }
  };

  // Find which container a goal belongs to
  const findContainer = (id) => {
    if (id in goalsByStatus) {
      return id;
    }

    return Object.keys(goalsByStatus).find(key =>
      goalsByStatus[key]?.some(item => item.id === id)
    );
  };

  // Handle adding a new goal to a column
  const handleAddGoal = (status) => {
    if (onGoalCreate) {
      onGoalCreate({ status });
    }
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Goal Board</h2>
            <p className="text-sm text-gray-500 mt-1">
              Drag and drop goals to update their status
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        {(showSearch || showFilters) && (
          <div className="flex gap-3">
            {showSearch && (
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search goals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            )}

            {showFilters && students.length > 0 && (
              <select
                value={selectedStudent || ''}
                onChange={(e) => setSelectedStudent(e.target.value || null)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Students</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToWindowEdges]}
      >
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-4 h-full min-w-max pb-4">
            {kanbanColumns.map(column => {
              const columnGoals = filteredGoalsByStatus[column.status] || [];
              const styles = getKanbanColumnStyles(column.status);

              return (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  goals={columnGoals}
                  styles={styles}
                  onAddGoal={() => handleAddGoal(column.status)}
                />
              );
            })}
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeGoal ? <DraggableGoalOverlay goal={activeGoal} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

/**
 * KanbanColumn Component
 * A single column in the Kanban board
 */
function KanbanColumn({ column, goals, styles, onAddGoal }) {
  return (
    <div className="flex-shrink-0 w-80">
      <Card className={cn('h-full flex flex-col', styles.bg, 'border-2', styles.border)}>
        {/* Column Header */}
        <div className={cn('p-4 border-b-2', styles.border, styles.header)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className={cn('font-semibold', styles.text)}>
                {column.title}
              </h3>
              <Badge variant="secondary" className="text-xs">
                {goals.length}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={onAddGoal}
                className="h-6 w-6 p-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Column Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          <SortableContext items={goals.map(g => g.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {goals.length === 0 ? (
                <EmptyDropZone message="No goals yet" />
              ) : (
                goals.map(goal => (
                  <DraggableGoal key={goal.id} goal={goal} />
                ))
              )}
            </div>
          </SortableContext>
        </div>
      </Card>
    </div>
  );
}

/**
 * CompactKanbanBoard Component
 * A more compact version for smaller spaces
 */
export function CompactKanbanBoard({
  goals = [],
  onGoalUpdate = null,
  columns = null,
  className = '',
}) {
  const defaultColumns = [
    { id: GOAL_STATUSES.ACTIVE, title: 'Active' },
    { id: GOAL_STATUSES.IN_PROGRESS, title: 'In Progress' },
    { id: GOAL_STATUSES.COMPLETED, title: 'Completed' },
  ];

  const kanbanColumns = columns || defaultColumns;
  const [activeGoal, setActiveGoal] = useState(null);

  const goalsByStatus = useMemo(() => {
    const grouped = {};
    kanbanColumns.forEach(col => {
      grouped[col.id] = goals.filter(g => g.status === col.id);
    });
    return grouped;
  }, [goals, kanbanColumns]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const handleDragStart = (event) => {
    const goal = goals.find(g => g.id === event.active.id);
    setActiveGoal(goal);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveGoal(null);

    if (!over || active.id === over.id) return;

    const activeGoal = goals.find(g => g.id === active.id);
    const newStatus = over.id;

    if (activeGoal && onGoalUpdate) {
      onGoalUpdate({ ...activeGoal, status: newStatus });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={cn('grid grid-cols-3 gap-4', className)}>
        {kanbanColumns.map(column => {
          const columnGoals = goalsByStatus[column.id] || [];
          const styles = getKanbanColumnStyles(column.id);

          return (
            <div key={column.id} className={cn('rounded-lg border-2 p-3', styles.border, styles.bg)}>
              <div className="flex items-center justify-between mb-3">
                <h4 className={cn('font-semibold text-sm', styles.text)}>
                  {column.title}
                </h4>
                <Badge variant="secondary" className="text-xs">
                  {columnGoals.length}
                </Badge>
              </div>
              <div className="space-y-2 min-h-[100px]">
                {columnGoals.map(goal => (
                  <div
                    key={goal.id}
                    className="p-2 bg-white rounded border text-sm"
                  >
                    {goal.description}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {activeGoal ? <DraggableGoalOverlay goal={activeGoal} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

export default KanbanBoard;
