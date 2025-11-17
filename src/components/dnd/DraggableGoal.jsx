import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Target, TrendingUp, Calendar } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

/**
 * DraggableGoal Component
 * A draggable goal card with smooth animations and visual feedback
 */
export function DraggableGoal({
  goal,
  isSelected = false,
  onSelect = null,
  showDragHandle = true,
  disabled = false,
  className = '',
  children = null,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: goal.id,
    disabled,
    data: {
      type: 'goal',
      goal,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Handle selection on click
  const handleClick = (e) => {
    if (onSelect && !isDragging) {
      onSelect(goal.id, e.ctrlKey || e.metaKey, e.shiftKey);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative',
        isDragging && 'opacity-50 z-50',
        className
      )}
    >
      <Card
        className={cn(
          'p-4 transition-all duration-200 cursor-pointer',
          'hover:shadow-lg hover:scale-[1.02]',
          'border-2',
          isSelected && 'border-blue-500 bg-blue-50',
          isDragging && 'shadow-2xl rotate-[-3deg]',
          isOver && 'border-green-500',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onClick={handleClick}
      >
        {/* Drag Handle */}
        {showDragHandle && !disabled && (
          <div
            className={cn(
              'absolute left-2 top-1/2 -translate-y-1/2',
              'cursor-grab active:cursor-grabbing',
              'opacity-0 group-hover:opacity-100 transition-opacity',
              'touch-none'
            )}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-5 h-5 text-gray-400" />
          </div>
        )}

        <div className={cn(showDragHandle && 'pl-6')}>
          {/* Goal Area Badge */}
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="text-xs">
              {goal.area || 'General'}
            </Badge>
            {goal.aiGenerated && (
              <Badge variant="secondary" className="text-xs">
                AI Generated
              </Badge>
            )}
          </div>

          {/* Goal Description */}
          <h3 className="font-semibold text-sm mb-2 line-clamp-2">
            {goal.description || 'No description'}
          </h3>

          {/* Goal Metrics */}
          <div className="space-y-1 text-xs text-gray-600">
            {goal.baseline && (
              <div className="flex items-center gap-2">
                <Target className="w-3 h-3" />
                <span>Baseline: {goal.baseline}</span>
              </div>
            )}
            {goal.target && (
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3 h-3" />
                <span>Target: {goal.target}</span>
              </div>
            )}
            {goal.metric && (
              <div className="text-gray-500">
                Metric: {goal.metric}
              </div>
            )}
          </div>

          {/* Created Date */}
          {goal.createdAt && (
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>{new Date(goal.createdAt).toLocaleDateString()}</span>
            </div>
          )}

          {/* Custom Children */}
          {children}
        </div>
      </Card>

      {/* Drop Indicator */}
      {isOver && (
        <div className="absolute inset-0 border-2 border-green-500 rounded-lg pointer-events-none animate-pulse" />
      )}

      {/* Multi-select indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full" />
        </div>
      )}
    </div>
  );
}

/**
 * DraggableGoalOverlay Component
 * The ghost element shown while dragging
 */
export function DraggableGoalOverlay({ goal }) {
  if (!goal) return null;

  return (
    <Card
      className={cn(
        'p-4 opacity-95 rotate-[-3deg]',
        'shadow-2xl border-2 border-blue-500',
        'bg-white cursor-grabbing'
      )}
    >
      <div>
        <Badge variant="outline" className="text-xs mb-2">
          {goal.area || 'General'}
        </Badge>

        <h3 className="font-semibold text-sm mb-2 line-clamp-2">
          {goal.description || 'No description'}
        </h3>

        <div className="space-y-1 text-xs text-gray-600">
          {goal.baseline && (
            <div className="flex items-center gap-2">
              <Target className="w-3 h-3" />
              <span>Baseline: {goal.baseline}</span>
            </div>
          )}
          {goal.target && (
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3 h-3" />
              <span>Target: {goal.target}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

/**
 * DraggableGoalPlaceholder Component
 * Shown in the original position while dragging
 */
export function DraggableGoalPlaceholder({ height = '120px' }) {
  return (
    <div
      className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 animate-pulse"
      style={{ height }}
    >
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Drop here
      </div>
    </div>
  );
}

/**
 * CompactDraggableGoal Component
 * A more compact version for dense lists
 */
export function CompactDraggableGoal({
  goal,
  isSelected = false,
  onSelect = null,
  disabled = false,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: goal.id,
    disabled,
    data: {
      type: 'goal',
      goal,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-3 p-3 rounded-lg border-2 transition-all',
        'hover:shadow-md hover:border-blue-300',
        isSelected && 'border-blue-500 bg-blue-50',
        isDragging && 'opacity-50',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      onClick={(e) => onSelect && onSelect(goal.id, e.ctrlKey || e.metaKey, e.shiftKey)}
    >
      {/* Drag Handle */}
      {!disabled && (
        <div
          className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="text-xs">
            {goal.area || 'General'}
          </Badge>
          {isSelected && (
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
          )}
        </div>
        <p className="text-sm font-medium truncate">
          {goal.description || 'No description'}
        </p>
      </div>
    </div>
  );
}

export default DraggableGoal;
