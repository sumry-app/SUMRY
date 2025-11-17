/**
 * SUMRY Batch Action Bar Component
 *
 * A comprehensive toolbar for batch operations with:
 * - Selection counter
 * - Bulk actions dropdown
 * - Select all/deselect all controls
 * - Undo/redo functionality
 * - Confirmation dialogs
 * - Progress indicators
 * - Error handling and feedback
 *
 * @module BatchActionBar
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Trash2,
  Download,
  Copy,
  Edit3,
  CheckSquare,
  Square,
  X,
  AlertTriangle,
  Loader2,
  Undo2,
  ChevronDown,
  Tag,
  FolderOpen,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';

// =============================================================================
// CONSTANTS
// =============================================================================

const ACTION_TYPES = {
  DELETE: 'delete',
  EXPORT: 'export',
  DUPLICATE: 'duplicate',
  EDIT: 'edit',
  ASSIGN: 'assign',
  TAG: 'tag',
  CATEGORIZE: 'categorize',
  STATUS_CHANGE: 'status_change',
};

const CONFIRMATION_LEVELS = {
  NONE: 'none',
  SOFT: 'soft', // Simple confirmation button
  HARD: 'hard', // Dialog with explicit confirmation
};

// =============================================================================
// BATCH ACTION BAR COMPONENT
// =============================================================================

export function BatchActionBar({
  // Selection state
  selectedIds = [],
  allIds = [],
  onSelectionChange,

  // Entity information
  entityType = 'items',
  entityTypeSingular = 'item',

  // Available actions
  actions = [],

  // Callbacks
  onBulkAction,
  onUndo,
  canUndo = false,

  // Styling
  className,
  position = 'sticky', // 'sticky' | 'fixed' | 'static'

  // Advanced options
  showProgress = true,
  maxHeight = '64px',
}) {
  // =============================================================================
  // STATE
  // =============================================================================

  const [confirmDialog, setConfirmDialog] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [progressInfo, setProgressInfo] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  // =============================================================================
  // SELECTION HELPERS
  // =============================================================================

  const selectedCount = selectedIds.length;
  const allSelected = selectedCount === allIds.length && allIds.length > 0;
  const someSelected = selectedCount > 0 && !allSelected;
  const noneSelected = selectedCount === 0;

  const handleSelectAll = useCallback(() => {
    onSelectionChange(allIds);
  }, [allIds, onSelectionChange]);

  const handleDeselectAll = useCallback(() => {
    onSelectionChange([]);
  }, [onSelectionChange]);

  const handleToggleSelectAll = useCallback(() => {
    if (allSelected) {
      handleDeselectAll();
    } else {
      handleSelectAll();
    }
  }, [allSelected, handleSelectAll, handleDeselectAll]);

  // =============================================================================
  // ACTION HANDLERS
  // =============================================================================

  const executeAction = useCallback(async (action, params = {}) => {
    setActionInProgress(true);
    setProgressInfo({
      action: action.label,
      current: 0,
      total: selectedCount,
    });

    try {
      const result = await onBulkAction({
        actionType: action.type,
        selectedIds,
        params,
      });

      setLastResult(result);

      // Show result for a few seconds
      setTimeout(() => {
        setLastResult(null);
      }, 5000);

      // Clear selection if successful
      if (result.success) {
        handleDeselectAll();
      }

      return result;
    } catch (error) {
      setLastResult({
        success: false,
        error: error.message,
      });
      return { success: false, error: error.message };
    } finally {
      setActionInProgress(false);
      setProgressInfo(null);
    }
  }, [onBulkAction, selectedIds, selectedCount, handleDeselectAll]);

  const handleActionClick = useCallback((action) => {
    if (noneSelected) return;

    // Check confirmation level
    if (action.confirmLevel === CONFIRMATION_LEVELS.HARD ||
        (action.confirmLevel === CONFIRMATION_LEVELS.SOFT && action.destructive)) {
      setConfirmDialog({
        action,
        title: action.confirmTitle || `Confirm ${action.label}`,
        description: action.confirmDescription ||
          `Are you sure you want to ${action.label.toLowerCase()} ${selectedCount} ${selectedCount === 1 ? entityTypeSingular : entityType}?`,
        destructive: action.destructive,
      });
    } else {
      executeAction(action);
    }
  }, [noneSelected, selectedCount, entityType, entityTypeSingular, executeAction]);

  const handleConfirmAction = useCallback(async (params = {}) => {
    if (!confirmDialog) return;

    const result = await executeAction(confirmDialog.action, params);
    setConfirmDialog(null);

    return result;
  }, [confirmDialog, executeAction]);

  const handleCancelConfirm = useCallback(() => {
    setConfirmDialog(null);
  }, []);

  const handleUndo = useCallback(() => {
    if (canUndo && onUndo) {
      onUndo();
      setLastResult(null);
    }
  }, [canUndo, onUndo]);

  // =============================================================================
  // DEFAULT ACTIONS
  // =============================================================================

  const defaultActions = [
    {
      type: ACTION_TYPES.DELETE,
      label: 'Delete',
      icon: Trash2,
      destructive: true,
      confirmLevel: CONFIRMATION_LEVELS.HARD,
      confirmTitle: 'Delete Items',
      confirmDescription: `This will permanently delete ${selectedCount} ${selectedCount === 1 ? entityTypeSingular : entityType}. This action cannot be undone.`,
    },
    {
      type: ACTION_TYPES.EXPORT,
      label: 'Export',
      icon: Download,
      confirmLevel: CONFIRMATION_LEVELS.NONE,
    },
    {
      type: ACTION_TYPES.DUPLICATE,
      label: 'Duplicate',
      icon: Copy,
      confirmLevel: CONFIRMATION_LEVELS.SOFT,
    },
  ];

  const availableActions = actions.length > 0 ? actions : defaultActions;

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderActionButton = (action) => {
    const Icon = action.icon;

    return (
      <Button
        key={action.type}
        variant={action.destructive ? 'destructive' : 'outline'}
        size="sm"
        disabled={noneSelected || actionInProgress}
        onClick={() => handleActionClick(action)}
        className={cn('gap-2', action.className)}
      >
        {Icon && <Icon className="h-4 w-4" />}
        {action.label}
      </Button>
    );
  };

  const renderProgress = () => {
    if (!showProgress || !progressInfo) return null;

    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>
          {progressInfo.action} ({progressInfo.current}/{progressInfo.total})
        </span>
      </div>
    );
  };

  const renderResult = () => {
    if (!lastResult) return null;

    const isSuccess = lastResult.success;
    const isPartial = lastResult.result?.isPartialSuccess?.();

    const Icon = isSuccess
      ? CheckCircle2
      : isPartial
      ? AlertCircle
      : XCircle;

    const bgColor = isSuccess
      ? 'bg-green-50 text-green-700 border-green-200'
      : isPartial
      ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
      : 'bg-red-50 text-red-700 border-red-200';

    return (
      <div className={cn('flex items-center gap-2 px-3 py-1 rounded-md text-sm border', bgColor)}>
        <Icon className="h-4 w-4" />
        <span>
          {isSuccess && `Success! ${lastResult.result?.successCount || selectedCount} ${entityType} processed.`}
          {isPartial && `Partial success: ${lastResult.result?.successCount}/${lastResult.result?.totalItems} completed.`}
          {!isSuccess && !isPartial && `Failed: ${lastResult.error || 'Unknown error'}`}
        </span>
        <button
          onClick={() => setLastResult(null)}
          className="ml-2 hover:opacity-70"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  // Don't render if no items are available
  if (allIds.length === 0) return null;

  const positionClasses = {
    sticky: 'sticky top-0 z-40',
    fixed: 'fixed top-0 left-0 right-0 z-50',
    static: 'relative',
  };

  return (
    <>
      <div
        className={cn(
          'bg-white border-b shadow-sm transition-all duration-200',
          positionClasses[position],
          selectedCount > 0 ? 'border-blue-200 bg-blue-50' : 'border-gray-200',
          className
        )}
        style={{ maxHeight }}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left side - Selection controls */}
            <div className="flex items-center gap-4">
              {/* Select all checkbox */}
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleToggleSelectAll}
                  aria-label="Select all items"
                  className={someSelected ? 'opacity-70' : ''}
                />
                {allSelected ? (
                  <CheckSquare className="h-4 w-4 text-blue-600" />
                ) : (
                  <Square className="h-4 w-4 text-gray-400" />
                )}
              </div>

              {/* Selection counter */}
              <div className="flex items-center gap-2">
                {selectedCount > 0 ? (
                  <>
                    <Badge variant="default" className="bg-blue-600">
                      {selectedCount}
                    </Badge>
                    <span className="text-sm font-medium text-gray-700">
                      {selectedCount === 1
                        ? `${entityTypeSingular} selected`
                        : `${entityType} selected`}
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-gray-500">
                    {allIds.length} {allIds.length === 1 ? entityTypeSingular : entityType}
                  </span>
                )}
              </div>

              {/* Deselect all button */}
              {selectedCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeselectAll}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            {/* Center - Progress/Result */}
            <div className="flex-1 flex items-center justify-center">
              {renderProgress()}
              {renderResult()}
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-2">
              {/* Action buttons */}
              {selectedCount > 0 && (
                <div className="flex items-center gap-2">
                  {availableActions.map(renderActionButton)}
                </div>
              )}

              {/* Undo button */}
              {canUndo && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUndo}
                  disabled={actionInProgress}
                  className="gap-2"
                >
                  <Undo2 className="h-4 w-4" />
                  Undo
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <ConfirmationDialog
          open={!!confirmDialog}
          onClose={handleCancelConfirm}
          onConfirm={handleConfirmAction}
          title={confirmDialog.title}
          description={confirmDialog.description}
          destructive={confirmDialog.destructive}
          action={confirmDialog.action}
          selectedCount={selectedCount}
        />
      )}
    </>
  );
}

// =============================================================================
// CONFIRMATION DIALOG COMPONENT
// =============================================================================

function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  destructive = false,
  action,
  selectedCount,
}) {
  const [confirming, setConfirming] = useState(false);
  const [params, setParams] = useState({});

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await onConfirm(params);
    } finally {
      setConfirming(false);
    }
  };

  // Render custom parameters based on action type
  const renderActionParams = () => {
    if (!action.requiresParams) return null;

    switch (action.type) {
      case ACTION_TYPES.ASSIGN:
        return (
          <div className="space-y-3 mt-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Assign to:
              </label>
              <Select
                value={params.assignTo}
                onValueChange={(value) => setParams({ ...params, assignTo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {action.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case ACTION_TYPES.TAG:
        return (
          <div className="space-y-3 mt-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Tag:
              </label>
              <Select
                value={params.tag}
                onValueChange={(value) => setParams({ ...params, tag: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tag..." />
                </SelectTrigger>
                <SelectContent>
                  {action.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case ACTION_TYPES.STATUS_CHANGE:
        return (
          <div className="space-y-3 mt-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                New Status:
              </label>
              <Select
                value={params.status}
                onValueChange={(value) => setParams({ ...params, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  {action.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {destructive && (
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            )}
            <DialogTitle className={destructive ? 'text-red-900' : ''}>
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="mt-3">
            {description}
          </DialogDescription>
        </DialogHeader>

        {renderActionParams()}

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={confirming}
          >
            Cancel
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={confirming}
          >
            {confirming ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {destructive ? 'Delete' : 'Confirm'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export default BatchActionBar;

export {
  ACTION_TYPES,
  CONFIRMATION_LEVELS,
};
