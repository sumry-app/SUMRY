import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { KanbanBoard, CompactKanbanBoard } from './KanbanBoard';
import { DraggableGoal, CompactDraggableGoal } from './DraggableGoal';
import {
  DroppableZone,
  SortableDropZone,
  CategorizationZone,
  AssignmentZone,
} from './DroppableZone';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Target, Users, BookOpen, Lightbulb } from 'lucide-react';
import { GOAL_STATUSES } from '../../lib/dragAndDrop';

/**
 * DndDemo Component
 * Comprehensive demo of all drag-and-drop features
 */
export function DndDemo() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Drag & Drop System Demo</h1>
        <p className="text-gray-600">
          Interactive examples of the SUMRY drag-and-drop system
        </p>
      </div>

      <Tabs defaultValue="kanban" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
          <TabsTrigger value="sortable">Sortable Lists</TabsTrigger>
          <TabsTrigger value="categorize">Categorization</TabsTrigger>
          <TabsTrigger value="assign">Assignment</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="mt-6">
          <KanbanDemo />
        </TabsContent>

        <TabsContent value="sortable" className="mt-6">
          <SortableDemo />
        </TabsContent>

        <TabsContent value="categorize" className="mt-6">
          <CategorizationDemo />
        </TabsContent>

        <TabsContent value="assign" className="mt-6">
          <AssignmentDemo />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Kanban Board Demo
 */
function KanbanDemo() {
  const [goals, setGoals] = useState([
    {
      id: '1',
      description: 'Improve reading comprehension',
      area: 'Reading',
      baseline: '40% accuracy',
      target: '80% accuracy',
      metric: 'Percentage correct',
      status: GOAL_STATUSES.ACTIVE,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      description: 'Master multiplication tables 1-10',
      area: 'Math',
      baseline: '3/10 correct',
      target: '9/10 correct',
      metric: 'Number correct',
      status: GOAL_STATUSES.IN_PROGRESS,
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      description: 'Write 5-paragraph essay',
      area: 'Writing',
      baseline: 'Cannot write paragraphs',
      target: 'Complete 5-paragraph essay',
      metric: 'Essay completion',
      status: GOAL_STATUSES.BACKLOG,
      createdAt: new Date().toISOString(),
      aiGenerated: true,
    },
    {
      id: '4',
      description: 'Identify emotions in social situations',
      area: 'Social Skills',
      baseline: '2/10 correct',
      target: '8/10 correct',
      metric: 'Number correct',
      status: GOAL_STATUSES.COMPLETED,
      createdAt: new Date().toISOString(),
    },
  ]);

  const students = [
    { id: 's1', name: 'John Doe', grade: '3rd Grade' },
    { id: 's2', name: 'Jane Smith', grade: '4th Grade' },
  ];

  const handleGoalUpdate = (updatedGoal) => {
    setGoals(prev => prev.map(g => (g.id === updatedGoal.id ? updatedGoal : g)));
  };

  const handleGoalCreate = ({ status }) => {
    const newGoal = {
      id: `goal-${Date.now()}`,
      description: 'New Goal',
      area: 'General',
      baseline: '',
      target: '',
      metric: '',
      status,
      createdAt: new Date().toISOString(),
    };
    setGoals(prev => [...prev, newGoal]);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Full Kanban Board</h2>
        <div className="h-[600px]">
          <KanbanBoard
            goals={goals}
            onGoalUpdate={handleGoalUpdate}
            onGoalCreate={handleGoalCreate}
            students={students}
          />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Compact Kanban Board</h2>
        <CompactKanbanBoard
          goals={goals}
          onGoalUpdate={handleGoalUpdate}
        />
      </Card>
    </div>
  );
}

/**
 * Sortable Lists Demo
 */
function SortableDemo() {
  const [items, setItems] = useState([
    {
      id: '1',
      description: 'Complete math worksheet',
      area: 'Math',
      baseline: '0/10',
      target: '8/10',
    },
    {
      id: '2',
      description: 'Read chapter book',
      area: 'Reading',
      baseline: '0 pages',
      target: '50 pages',
    },
    {
      id: '3',
      description: 'Practice handwriting',
      area: 'Writing',
      baseline: 'Illegible',
      target: 'Legible sentences',
    },
  ]);

  const [selectedIds, setSelectedIds] = useState([]);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSelect = (id, isCtrl, isShift) => {
    if (isCtrl) {
      setSelectedIds(prev =>
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
    } else {
      setSelectedIds([id]);
    }
  };

  const activeItem = items.find((item) => item.id === activeId);

  return (
    <div className="grid grid-cols-2 gap-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Default Sortable List</h2>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {items.map((item) => (
                <DraggableGoal
                  key={item.id}
                  goal={item}
                  isSelected={selectedIds.includes(item.id)}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeItem ? (
              <Card className="p-4 opacity-95 shadow-2xl">
                <h3 className="font-semibold">{activeItem.description}</h3>
              </Card>
            ) : null}
          </DragOverlay>
        </DndContext>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Compact Sortable List</h2>
        <div className="space-y-2">
          {items.map((item) => (
            <CompactDraggableGoal
              key={item.id}
              goal={item}
              isSelected={selectedIds.includes(item.id)}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}

/**
 * Categorization Demo
 */
function CategorizationDemo() {
  const categories = [
    { id: 'academic', name: 'Academic', color: 'blue', icon: BookOpen },
    { id: 'behavioral', name: 'Behavioral', color: 'green', icon: Users },
    { id: 'social', name: 'Social Skills', color: 'purple', icon: Lightbulb },
    { id: 'functional', name: 'Functional', color: 'yellow', icon: Target },
  ];

  const [categorizedGoals, setCategorizedGoals] = useState({
    academic: [
      { id: 'g1', description: 'Reading comprehension', area: 'Reading' },
      { id: 'g2', description: 'Math fluency', area: 'Math' },
    ],
    behavioral: [
      { id: 'g3', description: 'Reduce outbursts', area: 'Behavior' },
    ],
    social: [],
    functional: [
      { id: 'g4', description: 'Self-care skills', area: 'Life Skills' },
    ],
  });

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Categorize Goals</h2>
      <p className="text-sm text-gray-600 mb-6">
        Drag goals between categories to organize them
      </p>

      <div className="grid grid-cols-2 gap-4">
        {categories.map((category) => (
          <CategorizationZone
            key={category.id}
            id={category.id}
            category={category.name}
            items={categorizedGoals[category.id]}
            color={category.color}
            icon={category.icon}
          >
            <div className="space-y-2">
              {categorizedGoals[category.id].map((goal) => (
                <div
                  key={goal.id}
                  className="p-2 bg-white rounded border text-sm"
                >
                  {goal.description}
                </div>
              ))}
            </div>
          </CategorizationZone>
        ))}
      </div>
    </Card>
  );
}

/**
 * Assignment Demo
 */
function AssignmentDemo() {
  const students = [
    {
      id: 's1',
      name: 'John Doe',
      subtitle: '3rd Grade',
      goals: [
        { id: 'g1', description: 'Reading comprehension', area: 'Reading' },
        { id: 'g2', description: 'Math fluency', area: 'Math' },
      ],
    },
    {
      id: 's2',
      name: 'Jane Smith',
      subtitle: '4th Grade',
      goals: [
        { id: 'g3', description: 'Writing skills', area: 'Writing' },
      ],
    },
    {
      id: 's3',
      name: 'Bob Johnson',
      subtitle: '5th Grade',
      goals: [],
    },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Assign Goals to Students</h2>
      <p className="text-sm text-gray-600 mb-6">
        Drag goals from the pool or between students to assign them
      </p>

      <div className="grid grid-cols-3 gap-4">
        {students.map((student) => (
          <AssignmentZone
            key={student.id}
            id={student.id}
            entity={student}
            items={student.goals}
            acceptTypes={['goal']}
          >
            <div className="space-y-2">
              {student.goals.map((goal) => (
                <div
                  key={goal.id}
                  className="p-2 bg-gray-50 rounded border text-sm"
                >
                  <div className="font-medium">{goal.description}</div>
                  <div className="text-xs text-gray-500">{goal.area}</div>
                </div>
              ))}
            </div>
          </AssignmentZone>
        ))}
      </div>
    </Card>
  );
}

export default DndDemo;
