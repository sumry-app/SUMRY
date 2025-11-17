import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Check, X, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

/**
 * DroppableZone Component
 * A flexible drop zone with visual feedback and validation
 */
export function DroppableZone({
  id,
  children,
  acceptTypes = [],
  allowedOperations = ['move'],
  validate = null,
  onDrop = null,
  disabled = false,
  label = '',
  description = '',
  emptyState = null,
  className = '',
  contentClassName = '',
  orientation = 'vertical',
  showIndicator = true,
}) {
  const { setNodeRef, isOver, active } = useDroppable({
    id,
    disabled,
    data: {
      acceptTypes,
      allowedOperations,
      validate,
    },
  });

  // Determine if the current drag is valid for this zone
  const dragData = active?.data?.current;
  const isValidDrop = React.useMemo(() => {
    if (!dragData) return false;

    // Check type acceptance
    if (acceptTypes.length > 0 && !acceptTypes.includes(dragData.type)) {
      return false;
    }

    // Check operation allowance
    if (allowedOperations.length > 0 && !allowedOperations.includes(dragData.operation || 'move')) {
      return false;
    }

    // Custom validation
    if (validate && typeof validate === 'function') {
      return validate(dragData);
    }

    return true;
  }, [dragData, acceptTypes, allowedOperations, validate]);

  const state = !active ? 'idle' : isOver ? (isValidDrop ? 'valid' : 'invalid') : 'active';

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'relative transition-all duration-200',
        state === 'idle' && 'border-2 border-transparent',
        state === 'active' && 'border-2 border-dashed border-gray-300',
        state === 'valid' && 'border-2 border-dashed border-green-500 bg-green-50',
        state === 'invalid' && 'border-2 border-dashed border-red-500 bg-red-50',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {/* Header */}
      {(label || description) && (
        <div className="mb-4">
          {label && (
            <h3 className="text-sm font-semibold text-gray-700">{label}</h3>
          )}
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
      )}

      {/* Content */}
      <div className={cn('min-h-[100px]', contentClassName)}>
        {children || (
          <div className="flex items-center justify-center h-full py-8">
            {emptyState || (
              <div className="text-center text-gray-400">
                <p className="text-sm">Drop items here</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Visual Indicators */}
      {showIndicator && isOver && (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className={cn(
              'absolute inset-0 rounded-lg flex items-center justify-center',
              'backdrop-blur-sm',
              isValidDrop ? 'bg-green-500/10' : 'bg-red-500/10'
            )}
          >
            <div
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full',
                'font-semibold text-sm',
                isValidDrop ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              )}
            >
              {isValidDrop ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Drop here</span>
                </>
              ) : (
                <>
                  <X className="w-4 h-4" />
                  <span>Not allowed</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * SortableDropZone Component
 * A droppable zone that also allows internal sorting
 */
export function SortableDropZone({
  id,
  items = [],
  children,
  acceptTypes = [],
  allowedOperations = ['move', 'reorder'],
  disabled = false,
  label = '',
  emptyState = null,
  className = '',
  orientation = 'vertical',
  strategy = null,
}) {
  const sortingStrategy = strategy || (orientation === 'vertical' ? verticalListSortingStrategy : horizontalListSortingStrategy);

  const { setNodeRef, isOver, active } = useDroppable({
    id,
    disabled,
    data: {
      acceptTypes,
      allowedOperations,
      sortable: true,
    },
  });

  const dragData = active?.data?.current;
  const isValidDrop = React.useMemo(() => {
    if (!dragData) return false;
    if (acceptTypes.length > 0 && !acceptTypes.includes(dragData.type)) {
      return false;
    }
    return true;
  }, [dragData, acceptTypes]);

  const state = !active ? 'idle' : isOver ? (isValidDrop ? 'valid' : 'invalid') : 'active';

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'transition-all duration-200',
        state === 'idle' && 'border-2 border-transparent',
        state === 'active' && 'border-2 border-dashed border-gray-300',
        state === 'valid' && 'border-2 border-dashed border-green-500 bg-green-50',
        state === 'invalid' && 'border-2 border-dashed border-red-500 bg-red-50',
        className
      )}
    >
      {label && (
        <h3 className="text-sm font-semibold text-gray-700 mb-4">{label}</h3>
      )}

      <SortableContext items={items.map(item => item.id)} strategy={sortingStrategy}>
        <div
          className={cn(
            orientation === 'vertical' ? 'space-y-2' : 'flex gap-2',
            'min-h-[100px]'
          )}
        >
          {items.length === 0 && emptyState ? (
            <div className="flex items-center justify-center h-full py-8">
              {emptyState}
            </div>
          ) : (
            children
          )}
        </div>
      </SortableContext>
    </div>
  );
}

/**
 * CategorizationZone Component
 * A drop zone specifically for categorizing items
 */
export function CategorizationZone({
  id,
  category,
  items = [],
  children,
  onAdd = null,
  onRemove = null,
  color = 'blue',
  icon: Icon = null,
  disabled = false,
}) {
  const { setNodeRef, isOver, active } = useDroppable({
    id,
    disabled,
    data: {
      category,
      type: 'categorization',
    },
  });

  const colorClasses = {
    blue: 'border-blue-300 bg-blue-50 hover:bg-blue-100',
    green: 'border-green-300 bg-green-50 hover:bg-green-100',
    yellow: 'border-yellow-300 bg-yellow-50 hover:bg-yellow-100',
    red: 'border-red-300 bg-red-50 hover:bg-red-100',
    purple: 'border-purple-300 bg-purple-50 hover:bg-purple-100',
    gray: 'border-gray-300 bg-gray-50 hover:bg-gray-100',
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'rounded-lg border-2 p-4 transition-all duration-200',
        colorClasses[color] || colorClasses.blue,
        isOver && 'ring-4 ring-offset-2 ring-blue-500/50 scale-105',
        disabled && 'opacity-50'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5" />}
          <h3 className="font-semibold text-sm">{category}</h3>
        </div>
        <div className="text-xs text-gray-500">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </div>
      </div>

      <div className="space-y-2 min-h-[80px]">
        {children}
      </div>
    </div>
  );
}

/**
 * AssignmentZone Component
 * A drop zone for assigning items to entities (students, teachers, etc.)
 */
export function AssignmentZone({
  id,
  entity,
  items = [],
  children,
  acceptTypes = [],
  disabled = false,
  onAssign = null,
  showAddButton = true,
}) {
  const { setNodeRef, isOver, active } = useDroppable({
    id,
    disabled,
    data: {
      entity,
      acceptTypes,
      type: 'assignment',
    },
  });

  const dragData = active?.data?.current;
  const isValidDrop = React.useMemo(() => {
    if (!dragData) return false;
    if (acceptTypes.length > 0 && !acceptTypes.includes(dragData.type)) {
      return false;
    }
    return true;
  }, [dragData, acceptTypes]);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'rounded-lg border-2 p-4 transition-all duration-200',
        'border-gray-200 bg-white hover:border-gray-300',
        isOver && isValidDrop && 'border-green-500 bg-green-50 ring-4 ring-green-500/20',
        isOver && !isValidDrop && 'border-red-500 bg-red-50',
        disabled && 'opacity-50'
      )}
    >
      {/* Entity Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-sm">{entity.name}</h3>
          {entity.subtitle && (
            <p className="text-xs text-gray-500">{entity.subtitle}</p>
          )}
        </div>
        {showAddButton && onAssign && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onAssign(entity)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Items */}
      <div className="space-y-2 min-h-[60px]">
        {items.length === 0 ? (
          <div className="text-center text-gray-400 text-xs py-4">
            No items assigned
          </div>
        ) : (
          children
        )}
      </div>

      {/* Drop Indicator */}
      {isOver && (
        <div className="mt-2 pt-2 border-t-2 border-dashed">
          <div
            className={cn(
              'flex items-center gap-2 text-xs font-medium',
              isValidDrop ? 'text-green-600' : 'text-red-600'
            )}
          >
            <ArrowRight className="w-4 h-4" />
            {isValidDrop ? 'Drop to assign' : 'Cannot assign'}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * EmptyDropZone Component
 * A simple empty state for drop zones
 */
export function EmptyDropZone({ message = 'Drop items here', icon: Icon = Plus }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
      <Icon className="w-8 h-8 mb-2" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

export default DroppableZone;
