/**
 * SUMRY Design System - Toast Notification Component
 *
 * A comprehensive toast notification system with:
 * - Multiple variants (success, error, warning, info)
 * - Auto-dismiss functionality
 * - Action buttons
 * - Custom icons
 * - Smooth animations
 * - Multiple position options
 * - Queue management
 *
 * @module Toast
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// CONSTANTS
// =============================================================================

const TOAST_VARIANTS = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

const TOAST_POSITIONS = {
  TOP_RIGHT: 'top-right',
  TOP_LEFT: 'top-left',
  TOP_CENTER: 'top-center',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_CENTER: 'bottom-center',
};

const DEFAULT_DURATION = 5000; // 5 seconds
const ANIMATION_DURATION = 300; // 300ms

// =============================================================================
// TOAST CONTEXT
// =============================================================================

const ToastContext = createContext(null);

/**
 * Hook to access toast functions
 * @returns {object} Toast context
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// =============================================================================
// TOAST ICONS
// =============================================================================

const TOAST_ICONS = {
  [TOAST_VARIANTS.SUCCESS]: CheckCircle2,
  [TOAST_VARIANTS.ERROR]: XCircle,
  [TOAST_VARIANTS.WARNING]: AlertTriangle,
  [TOAST_VARIANTS.INFO]: Info,
};

// =============================================================================
// TOAST STYLES
// =============================================================================

const toastVariantStyles = {
  [TOAST_VARIANTS.SUCCESS]: {
    container: 'bg-card border-success/30',
    icon: 'text-success',
    title: 'text-foreground',
    description: 'text-muted-foreground',
    closeButton: 'text-muted-foreground hover:text-foreground',
  },
  [TOAST_VARIANTS.ERROR]: {
    container: 'bg-card border-destructive/30',
    icon: 'text-destructive',
    title: 'text-foreground',
    description: 'text-muted-foreground',
    closeButton: 'text-muted-foreground hover:text-foreground',
  },
  [TOAST_VARIANTS.WARNING]: {
    container: 'bg-card border-warning/40',
    icon: 'text-warning',
    title: 'text-foreground',
    description: 'text-muted-foreground',
    closeButton: 'text-muted-foreground hover:text-foreground',
  },
  [TOAST_VARIANTS.INFO]: {
    container: 'bg-card border-info/30',
    icon: 'text-info',
    title: 'text-foreground',
    description: 'text-muted-foreground',
    closeButton: 'text-muted-foreground hover:text-foreground',
  },
};

const positionStyles = {
  [TOAST_POSITIONS.TOP_RIGHT]: 'top-4 right-4',
  [TOAST_POSITIONS.TOP_LEFT]: 'top-4 left-4',
  [TOAST_POSITIONS.TOP_CENTER]: 'top-4 left-1/2 -translate-x-1/2',
  [TOAST_POSITIONS.BOTTOM_RIGHT]: 'bottom-4 right-4',
  [TOAST_POSITIONS.BOTTOM_LEFT]: 'bottom-4 left-4',
  [TOAST_POSITIONS.BOTTOM_CENTER]: 'bottom-4 left-1/2 -translate-x-1/2',
};

// =============================================================================
// TOAST COMPONENT
// =============================================================================

/**
 * Individual Toast component
 */
function Toast({
  id,
  variant = TOAST_VARIANTS.INFO,
  title,
  description,
  icon: CustomIcon,
  action,
  onClose,
  duration = DEFAULT_DURATION,
  persistent = false,
}) {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  const styles = toastVariantStyles[variant];
  const Icon = CustomIcon || TOAST_ICONS[variant];

  // Auto-dismiss timer
  useEffect(() => {
    if (persistent || !duration) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
    }, 50);

    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [duration, persistent]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, ANIMATION_DURATION);
  };

  return (
    <div
      className={cn(
        'w-full max-w-sm overflow-hidden rounded-2xl border shadow-float',
        'transition-all duration-300 ease-spring',
        isExiting
          ? 'opacity-0 scale-95 translate-x-8'
          : 'opacity-100 scale-100 translate-x-0',
        styles.container
      )}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Progress bar */}
      {!persistent && duration && (
        <div className="h-0.5 bg-border">
          <div
            className={cn('h-full bg-current opacity-70 transition-all duration-50', styles.icon)}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        {Icon && (
          <div className={cn('flex-shrink-0 mt-0.5', styles.icon)}>
            <Icon size={20} />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={cn('text-sm font-semibold mb-1', styles.title)}>
              {title}
            </h3>
          )}
          {description && (
            <p className={cn('text-sm', styles.description)}>
              {description}
            </p>
          )}

          {/* Action button */}
          {action && (
            <button
              onClick={action.onClick}
              className={cn(
                'mt-3 rounded-lg bg-muted px-3 py-1.5 text-sm font-semibold',
                'transition-colors hover:bg-secondary',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                styles.title
              )}
            >
              {action.label}
            </button>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className={cn(
            'flex-shrink-0 rounded-md p-1',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            styles.closeButton
          )}
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// TOAST CONTAINER
// =============================================================================

/**
 * Toast container component that renders all toasts
 */
function ToastContainer({ toasts, position, onClose }) {
  if (toasts.length === 0) return null;

  return createPortal(
    <div
      className={cn(
        'fixed z-[1090] flex flex-col gap-3',
        'pointer-events-none',
        positionStyles[position]
      )}
      style={{ maxWidth: 'calc(100vw - 2rem)' }}
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} onClose={onClose} />
        </div>
      ))}
    </div>,
    document.body
  );
}

// =============================================================================
// TOAST PROVIDER
// =============================================================================

/**
 * ToastProvider component that manages toast state
 *
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} [props.position='top-right'] - Default toast position
 * @param {number} [props.max=5] - Maximum number of toasts to show
 *
 * @example
 * ```jsx
 * <ToastProvider position="top-right" max={3}>
 *   <App />
 * </ToastProvider>
 * ```
 */
export function ToastProvider({
  children,
  position = TOAST_POSITIONS.TOP_RIGHT,
  max = 5,
}) {
  const [toasts, setToasts] = useState([]);

  /**
   * Adds a new toast
   * @param {object} options - Toast options
   * @returns {string} Toast ID
   */
  const addToast = useCallback((options) => {
    const id = Math.random().toString(36).substr(2, 9);

    setToasts((prev) => {
      const newToasts = [{ id, ...options }, ...prev];
      // Limit to max toasts
      return newToasts.slice(0, max);
    });

    return id;
  }, [max]);

  /**
   * Removes a toast by ID
   * @param {string} id - Toast ID
   */
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  /**
   * Removes all toasts
   */
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  /**
   * Shows a success toast
   * @param {string} title - Toast title
   * @param {object} [options] - Additional options
   */
  const success = useCallback((title, options = {}) => {
    return addToast({
      variant: TOAST_VARIANTS.SUCCESS,
      title,
      ...options,
    });
  }, [addToast]);

  /**
   * Shows an error toast
   * @param {string} title - Toast title
   * @param {object} [options] - Additional options
   */
  const error = useCallback((title, options = {}) => {
    return addToast({
      variant: TOAST_VARIANTS.ERROR,
      title,
      ...options,
    });
  }, [addToast]);

  /**
   * Shows a warning toast
   * @param {string} title - Toast title
   * @param {object} [options] - Additional options
   */
  const warning = useCallback((title, options = {}) => {
    return addToast({
      variant: TOAST_VARIANTS.WARNING,
      title,
      ...options,
    });
  }, [addToast]);

  /**
   * Shows an info toast
   * @param {string} title - Toast title
   * @param {object} [options] - Additional options
   */
  const info = useCallback((title, options = {}) => {
    return addToast({
      variant: TOAST_VARIANTS.INFO,
      title,
      ...options,
    });
  }, [addToast]);

  /**
   * Shows a custom toast
   * @param {object} options - Toast options
   */
  const custom = useCallback((options) => {
    return addToast(options);
  }, [addToast]);

  /**
   * Shows a promise toast that updates based on promise state
   * @param {Promise} promise - Promise to track
   * @param {object} messages - Messages for different states
   */
  const promise = useCallback((promise, messages) => {
    const id = addToast({
      variant: TOAST_VARIANTS.INFO,
      title: messages.loading || 'Loading...',
      persistent: true,
    });

    promise
      .then((result) => {
        removeToast(id);
        success(messages.success || 'Success!', {
          description: messages.successDescription,
        });
        return result;
      })
      .catch((error) => {
        removeToast(id);
        this.error(messages.error || 'Error occurred', {
          description: error.message || messages.errorDescription,
        });
        throw error;
      });

    return promise;
  }, [addToast, removeToast, success]);

  const contextValue = {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info,
    custom,
    promise,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer
        toasts={toasts}
        position={position}
        onClose={removeToast}
      />
    </ToastContext.Provider>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export { TOAST_VARIANTS, TOAST_POSITIONS };
export default Toast;

/**
 * Usage Examples:
 *
 * 1. Basic usage:
 * ```jsx
 * const { success, error } = useToast();
 *
 * success('Profile updated!');
 * error('Failed to save changes');
 * ```
 *
 * 2. With description:
 * ```jsx
 * success('Profile updated!', {
 *   description: 'Your changes have been saved successfully.',
 * });
 * ```
 *
 * 3. With action button:
 * ```jsx
 * error('Failed to save', {
 *   description: 'Could not connect to server',
 *   action: {
 *     label: 'Retry',
 *     onClick: () => saveData(),
 *   },
 * });
 * ```
 *
 * 4. Custom icon:
 * ```jsx
 * import { Rocket } from 'lucide-react';
 *
 * info('New feature available!', {
 *   icon: Rocket,
 *   duration: 10000,
 * });
 * ```
 *
 * 5. Persistent toast:
 * ```jsx
 * warning('Important notice', {
 *   description: 'Please read this carefully',
 *   persistent: true,
 * });
 * ```
 *
 * 6. Promise toast:
 * ```jsx
 * const { promise } = useToast();
 *
 * promise(saveData(), {
 *   loading: 'Saving...',
 *   success: 'Saved successfully!',
 *   error: 'Failed to save',
 * });
 * ```
 */
