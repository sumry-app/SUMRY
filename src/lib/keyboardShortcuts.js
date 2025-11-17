/**
 * SUMRY Design System - Keyboard Shortcuts System
 *
 * Comprehensive keyboard shortcuts management with:
 * - Global shortcuts registry
 * - Shortcut handler with conflict detection
 * - Help modal component
 * - Platform detection (Mac/Windows)
 * - Scope-based shortcuts
 * - Enable/disable functionality
 *
 * @module keyboardShortcuts
 */

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  Command,
  Search,
  Save,
  Copy,
  Clipboard,
  Undo,
  Redo,
  FileText,
  HelpCircle,
  X,
  Keyboard,
} from 'lucide-react';

// =============================================================================
// PLATFORM DETECTION
// =============================================================================

/**
 * Detects the current platform
 * @returns {string} 'mac' or 'windows'
 */
export function getPlatform() {
  if (typeof window === 'undefined') return 'windows';

  const platform = window.navigator.platform.toLowerCase();
  const userAgent = window.navigator.userAgent.toLowerCase();

  return platform.includes('mac') || userAgent.includes('mac')
    ? 'mac'
    : 'windows';
}

/**
 * Checks if current platform is Mac
 * @returns {boolean}
 */
export function isMac() {
  return getPlatform() === 'mac';
}

/**
 * Gets the modifier key for the current platform
 * @returns {string} 'Cmd' for Mac, 'Ctrl' for Windows
 */
export function getModifierKey() {
  return isMac() ? 'Cmd' : 'Ctrl';
}

// =============================================================================
// KEY UTILITIES
// =============================================================================

/**
 * Normalizes key names for consistency
 * @param {string} key - Key name
 * @returns {string} Normalized key name
 */
function normalizeKey(key) {
  const keyMap = {
    command: 'meta',
    cmd: 'meta',
    control: 'ctrl',
    option: 'alt',
    return: 'enter',
    escape: 'esc',
    arrowup: 'up',
    arrowdown: 'down',
    arrowleft: 'left',
    arrowright: 'right',
  };

  return keyMap[key.toLowerCase()] || key.toLowerCase();
}

/**
 * Parses a shortcut string into an object
 * @param {string} shortcut - Shortcut string (e.g., "Cmd+K", "Ctrl+Shift+S")
 * @returns {object} Parsed shortcut
 */
export function parseShortcut(shortcut) {
  const parts = shortcut.split('+').map((s) => s.trim());
  const normalized = parts.map(normalizeKey);

  return {
    ctrl: normalized.includes('ctrl'),
    alt: normalized.includes('alt'),
    shift: normalized.includes('shift'),
    meta: normalized.includes('meta'),
    key: normalized[normalized.length - 1],
  };
}

/**
 * Checks if a keyboard event matches a shortcut
 * @param {KeyboardEvent} event - Keyboard event
 * @param {object} shortcut - Parsed shortcut object
 * @returns {boolean}
 */
export function matchesShortcut(event, shortcut) {
  const eventKey = normalizeKey(event.key);

  return (
    eventKey === shortcut.key &&
    event.ctrlKey === shortcut.ctrl &&
    event.altKey === shortcut.alt &&
    event.shiftKey === shortcut.shift &&
    event.metaKey === shortcut.meta
  );
}

/**
 * Formats a shortcut for display
 * @param {string} shortcut - Shortcut string
 * @returns {string} Formatted shortcut
 */
export function formatShortcut(shortcut) {
  const platform = getPlatform();
  let formatted = shortcut;

  if (platform === 'mac') {
    formatted = formatted
      .replace(/Ctrl/g, '⌃')
      .replace(/Alt/g, '⌥')
      .replace(/Shift/g, '⇧')
      .replace(/Cmd/g, '⌘')
      .replace(/Meta/g, '⌘');
  } else {
    formatted = formatted.replace(/Cmd/g, 'Ctrl').replace(/Meta/g, 'Ctrl');
  }

  return formatted;
}

// =============================================================================
// SHORTCUTS REGISTRY
// =============================================================================

/**
 * Default shortcuts configuration
 */
export const DEFAULT_SHORTCUTS = {
  // Global navigation
  search: {
    keys: ['Cmd+K', 'Ctrl+K'],
    description: 'Open search',
    category: 'Navigation',
    icon: Search,
  },
  help: {
    keys: ['?', 'Cmd+/', 'Ctrl+/'],
    description: 'Show keyboard shortcuts',
    category: 'General',
    icon: HelpCircle,
  },

  // File operations
  save: {
    keys: ['Cmd+S', 'Ctrl+S'],
    description: 'Save current item',
    category: 'File',
    icon: Save,
  },
  newDocument: {
    keys: ['Cmd+N', 'Ctrl+N'],
    description: 'Create new document',
    category: 'File',
    icon: FileText,
  },

  // Editing
  copy: {
    keys: ['Cmd+C', 'Ctrl+C'],
    description: 'Copy selection',
    category: 'Editing',
    icon: Copy,
  },
  paste: {
    keys: ['Cmd+V', 'Ctrl+V'],
    description: 'Paste from clipboard',
    category: 'Editing',
    icon: Clipboard,
  },
  undo: {
    keys: ['Cmd+Z', 'Ctrl+Z'],
    description: 'Undo last action',
    category: 'Editing',
    icon: Undo,
  },
  redo: {
    keys: ['Cmd+Shift+Z', 'Ctrl+Shift+Z', 'Cmd+Y', 'Ctrl+Y'],
    description: 'Redo last action',
    category: 'Editing',
    icon: Redo,
  },

  // UI
  closeModal: {
    keys: ['Esc'],
    description: 'Close modal or dialog',
    category: 'UI',
    icon: X,
  },
};

// =============================================================================
// KEYBOARD SHORTCUTS CONTEXT
// =============================================================================

const KeyboardShortcutsContext = createContext(null);

/**
 * Hook to access keyboard shortcuts functionality
 */
export function useKeyboardShortcuts() {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error(
      'useKeyboardShortcuts must be used within KeyboardShortcutsProvider'
    );
  }
  return context;
}

// =============================================================================
// KEYBOARD SHORTCUTS PROVIDER
// =============================================================================

/**
 * KeyboardShortcutsProvider component
 *
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {object} [props.shortcuts] - Custom shortcuts configuration
 * @param {boolean} [props.enabled=true] - Enable/disable shortcuts
 *
 * @example
 * ```jsx
 * <KeyboardShortcutsProvider shortcuts={customShortcuts}>
 *   <App />
 * </KeyboardShortcutsProvider>
 * ```
 */
export function KeyboardShortcutsProvider({
  children,
  shortcuts: customShortcuts = {},
  enabled = true,
}) {
  const [shortcuts] = useState(() => ({
    ...DEFAULT_SHORTCUTS,
    ...customShortcuts,
  }));

  const [handlers, setHandlers] = useState({});
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [showHelp, setShowHelp] = useState(false);

  /**
   * Registers a keyboard shortcut handler
   * @param {string} shortcutId - Shortcut ID
   * @param {function} handler - Handler function
   * @param {object} [options] - Options
   */
  const registerHandler = useCallback((shortcutId, handler, options = {}) => {
    setHandlers((prev) => ({
      ...prev,
      [shortcutId]: {
        handler,
        scope: options.scope || 'global',
        enabled: options.enabled !== false,
      },
    }));

    // Return cleanup function
    return () => {
      setHandlers((prev) => {
        const newHandlers = { ...prev };
        delete newHandlers[shortcutId];
        return newHandlers;
      });
    };
  }, []);

  /**
   * Unregisters a keyboard shortcut handler
   * @param {string} shortcutId - Shortcut ID
   */
  const unregisterHandler = useCallback((shortcutId) => {
    setHandlers((prev) => {
      const newHandlers = { ...prev };
      delete newHandlers[shortcutId];
      return newHandlers;
    });
  }, []);

  /**
   * Enables or disables a specific shortcut
   * @param {string} shortcutId - Shortcut ID
   * @param {boolean} enabled - Enable/disable
   */
  const setShortcutEnabled = useCallback((shortcutId, enabled) => {
    setHandlers((prev) => {
      if (!prev[shortcutId]) return prev;

      return {
        ...prev,
        [shortcutId]: {
          ...prev[shortcutId],
          enabled,
        },
      };
    });
  }, []);

  /**
   * Gets shortcut for current platform
   * @param {string} shortcutId - Shortcut ID
   * @returns {string} Shortcut string
   */
  const getShortcut = useCallback(
    (shortcutId) => {
      const shortcut = shortcuts[shortcutId];
      if (!shortcut) return null;

      const platform = getPlatform();
      const keys = Array.isArray(shortcut.keys) ? shortcut.keys : [shortcut.keys];

      // Find platform-specific shortcut
      const platformKey =
        keys.find((k) => {
          if (platform === 'mac') {
            return k.includes('Cmd') || k.includes('Meta');
          } else {
            return k.includes('Ctrl');
          }
        }) || keys[0];

      return platformKey;
    },
    [shortcuts]
  );

  /**
   * Formats shortcut for display
   * @param {string} shortcutId - Shortcut ID
   * @returns {string} Formatted shortcut
   */
  const formatShortcutDisplay = useCallback(
    (shortcutId) => {
      const shortcut = getShortcut(shortcutId);
      return shortcut ? formatShortcut(shortcut) : '';
    },
    [getShortcut]
  );

  // Keyboard event handler
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (event) => {
      // Don't handle shortcuts in input fields unless explicitly allowed
      const target = event.target;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Find matching shortcuts
      Object.entries(shortcuts).forEach(([id, shortcut]) => {
        const handler = handlers[id];
        if (!handler || !handler.enabled) return;

        const keys = Array.isArray(shortcut.keys)
          ? shortcut.keys
          : [shortcut.keys];

        const matched = keys.some((key) => {
          const parsed = parseShortcut(key);
          return matchesShortcut(event, parsed);
        });

        if (matched) {
          // Skip if in input field and shortcut doesn't allow it
          if (isInput && !shortcut.allowInInput) {
            return;
          }

          event.preventDefault();
          event.stopPropagation();
          handler.handler(event);
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, handlers, isEnabled]);

  // Register help shortcut
  useEffect(() => {
    return registerHandler('help', () => setShowHelp(true));
  }, [registerHandler]);

  const contextValue = useMemo(
    () => ({
      shortcuts,
      registerHandler,
      unregisterHandler,
      setShortcutEnabled,
      getShortcut,
      formatShortcut: formatShortcutDisplay,
      isEnabled,
      setIsEnabled,
      showHelp,
      setShowHelp,
    }),
    [
      shortcuts,
      registerHandler,
      unregisterHandler,
      setShortcutEnabled,
      getShortcut,
      formatShortcutDisplay,
      isEnabled,
      showHelp,
    ]
  );

  return (
    <KeyboardShortcutsContext.Provider value={contextValue}>
      {children}
      {showHelp && <KeyboardShortcutsHelp />}
    </KeyboardShortcutsContext.Provider>
  );
}

// =============================================================================
// KEYBOARD SHORTCUTS HELP MODAL
// =============================================================================

/**
 * Keyboard shortcuts help modal component
 */
function KeyboardShortcutsHelp() {
  const { shortcuts, setShowHelp, formatShortcut } = useKeyboardShortcuts();

  // Group shortcuts by category
  const groupedShortcuts = useMemo(() => {
    const groups = {};

    Object.entries(shortcuts).forEach(([id, shortcut]) => {
      const category = shortcut.category || 'General';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push({ id, ...shortcut });
    });

    return groups;
  }, [shortcuts]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setShowHelp(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [setShowHelp]);

  return (
    <div
      className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={() => setShowHelp(false)}
    >
      <div
        className={cn(
          'bg-white dark:bg-gray-900 rounded-xl shadow-2xl',
          'w-full max-w-3xl max-h-[80vh] overflow-hidden',
          'flex flex-col'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Keyboard className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Keyboard Shortcuts
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Quick reference for all available shortcuts
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowHelp(false)}
            className={cn(
              'p-2 rounded-lg text-gray-500 dark:text-gray-400',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              'transition-colors'
            )}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  {category}
                </h3>
                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut) => {
                    const Icon = shortcut.icon;
                    const keys = Array.isArray(shortcut.keys)
                      ? shortcut.keys
                      : [shortcut.keys];
                    const displayKey = keys.find((k) => {
                      if (isMac()) {
                        return k.includes('Cmd') || k.includes('Meta');
                      } else {
                        return k.includes('Ctrl');
                      }
                    }) || keys[0];

                    return (
                      <div
                        key={shortcut.id}
                        className={cn(
                          'flex items-center justify-between p-3',
                          'rounded-lg',
                          'bg-gray-50 dark:bg-gray-800/50'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {Icon && (
                            <div className="text-gray-500 dark:text-gray-400">
                              <Icon size={18} />
                            </div>
                          )}
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {shortcut.description}
                          </span>
                        </div>
                        <kbd
                          className={cn(
                            'px-3 py-1.5 rounded-md',
                            'bg-white dark:bg-gray-900',
                            'border border-gray-300 dark:border-gray-600',
                            'text-xs font-mono font-semibold',
                            'text-gray-700 dark:text-gray-300',
                            'shadow-sm'
                          )}
                        >
                          {formatShortcut(displayKey)}
                        </kbd>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-center text-gray-600 dark:text-gray-400">
            Press <kbd className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 font-mono">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// CUSTOM HOOKS
// =============================================================================

/**
 * Hook to register a keyboard shortcut
 * @param {string} shortcutId - Shortcut ID
 * @param {function} handler - Handler function
 * @param {object} [options] - Options
 *
 * @example
 * ```jsx
 * useKeyboardShortcut('save', () => {
 *   console.log('Save triggered!');
 * });
 * ```
 */
export function useKeyboardShortcut(shortcutId, handler, options = {}) {
  const { registerHandler } = useKeyboardShortcuts();

  useEffect(() => {
    if (!handler) return;
    return registerHandler(shortcutId, handler, options);
  }, [shortcutId, handler, registerHandler, options]);
}

/**
 * Hook to register multiple keyboard shortcuts
 * @param {object} shortcuts - Shortcuts object { id: handler }
 * @param {object} [options] - Options
 *
 * @example
 * ```jsx
 * useKeyboardShortcuts({
 *   save: handleSave,
 *   search: handleSearch,
 * });
 * ```
 */
export function useKeyboardShortcutsMap(shortcuts, options = {}) {
  const { registerHandler } = useKeyboardShortcuts();

  useEffect(() => {
    const cleanups = Object.entries(shortcuts).map(([id, handler]) =>
      registerHandler(id, handler, options)
    );

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [shortcuts, registerHandler, options]);
}

// =============================================================================
// EXPORTS
// =============================================================================

export default KeyboardShortcutsProvider;

/**
 * Usage Examples:
 *
 * 1. Setup in App.jsx:
 * ```jsx
 * import { KeyboardShortcutsProvider } from '@/lib/keyboardShortcuts';
 *
 * function App() {
 *   return (
 *     <KeyboardShortcutsProvider>
 *       <YourApp />
 *     </KeyboardShortcutsProvider>
 *   );
 * }
 * ```
 *
 * 2. Register a shortcut in a component:
 * ```jsx
 * import { useKeyboardShortcut } from '@/lib/keyboardShortcuts';
 *
 * function MyComponent() {
 *   useKeyboardShortcut('save', () => {
 *     console.log('Saving...');
 *   });
 *
 *   return <div>...</div>;
 * }
 * ```
 *
 * 3. Register multiple shortcuts:
 * ```jsx
 * import { useKeyboardShortcutsMap } from '@/lib/keyboardShortcuts';
 *
 * function MyComponent() {
 *   useKeyboardShortcutsMap({
 *     save: handleSave,
 *     search: handleSearch,
 *     undo: handleUndo,
 *   });
 *
 *   return <div>...</div>;
 * }
 * ```
 *
 * 4. Add custom shortcuts:
 * ```jsx
 * const customShortcuts = {
 *   customAction: {
 *     keys: ['Cmd+Shift+X', 'Ctrl+Shift+X'],
 *     description: 'Custom action',
 *     category: 'Custom',
 *     allowInInput: false,
 *   },
 * };
 *
 * <KeyboardShortcutsProvider shortcuts={customShortcuts}>
 *   <App />
 * </KeyboardShortcutsProvider>
 * ```
 *
 * 5. Show help modal programmatically:
 * ```jsx
 * const { setShowHelp } = useKeyboardShortcuts();
 * setShowHelp(true);
 * ```
 */
