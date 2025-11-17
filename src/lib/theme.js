/**
 * SUMRY Design System - Theme Management
 *
 * Provides theme switching functionality with:
 * - useTheme hook for accessing current theme
 * - ThemeProvider component for app-wide theme context
 * - localStorage persistence
 * - System preference detection
 * - Smooth theme transitions
 *
 * @module theme
 */

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { lightTheme, darkTheme } from '@/styles/designTokens';

// =============================================================================
// CONSTANTS
// =============================================================================

const THEME_STORAGE_KEY = 'sumry-theme-preference';
const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

// =============================================================================
// THEME CONTEXT
// =============================================================================

/**
 * Theme context for managing theme state across the application
 */
const ThemeContext = createContext({
  theme: lightTheme,
  themeMode: THEME_MODES.LIGHT,
  isDark: false,
  setThemeMode: () => {},
  toggleTheme: () => {},
});

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Detects the system color scheme preference
 * @returns {string} 'dark' or 'light'
 */
function getSystemTheme() {
  if (typeof window === 'undefined') return THEME_MODES.LIGHT;

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? THEME_MODES.DARK
    : THEME_MODES.LIGHT;
}

/**
 * Gets the stored theme preference from localStorage
 * @returns {string} Stored theme mode or 'system' as default
 */
function getStoredTheme() {
  if (typeof window === 'undefined') return THEME_MODES.SYSTEM;

  try {
    return localStorage.getItem(THEME_STORAGE_KEY) || THEME_MODES.SYSTEM;
  } catch (error) {
    console.error('Error reading theme from localStorage:', error);
    return THEME_MODES.SYSTEM;
  }
}

/**
 * Stores the theme preference in localStorage
 * @param {string} themeMode - Theme mode to store
 */
function setStoredTheme(themeMode) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  } catch (error) {
    console.error('Error saving theme to localStorage:', error);
  }
}

/**
 * Resolves the actual theme to use based on mode and system preference
 * @param {string} themeMode - Current theme mode
 * @returns {string} 'dark' or 'light'
 */
function resolveTheme(themeMode) {
  if (themeMode === THEME_MODES.SYSTEM) {
    return getSystemTheme();
  }
  return themeMode;
}

/**
 * Applies theme to document root
 * @param {boolean} isDark - Whether dark theme is active
 */
function applyThemeToDocument(isDark) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Add/remove dark class for Tailwind dark mode
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Set color-scheme for native browser controls
  root.style.colorScheme = isDark ? 'dark' : 'light';
}

/**
 * Applies CSS custom properties from theme
 * @param {object} theme - Theme object
 */
function applyThemeCSSVariables(theme) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Apply color variables
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
}

// =============================================================================
// THEME PROVIDER COMPONENT
// =============================================================================

/**
 * ThemeProvider component that wraps the app and provides theme context
 *
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} [props.defaultTheme='system'] - Default theme mode
 * @param {boolean} [props.enableTransitions=true] - Enable smooth theme transitions
 *
 * @example
 * ```jsx
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({
  children,
  defaultTheme = THEME_MODES.SYSTEM,
  enableTransitions = true,
}) {
  // Initialize theme mode from storage or default
  const [themeMode, setThemeModeState] = useState(() => {
    const stored = getStoredTheme();
    return stored || defaultTheme;
  });

  // Track if component is mounted (for SSR compatibility)
  const [mounted, setMounted] = useState(false);

  // Resolve actual theme (light/dark) from mode
  const resolvedTheme = useMemo(() => resolveTheme(themeMode), [themeMode]);
  const isDark = resolvedTheme === THEME_MODES.DARK;

  // Get theme object based on resolved theme
  const theme = useMemo(() => (isDark ? darkTheme : lightTheme), [isDark]);

  /**
   * Sets the theme mode and persists to localStorage
   * @param {string} newMode - New theme mode to set
   */
  const setThemeMode = (newMode) => {
    if (!Object.values(THEME_MODES).includes(newMode)) {
      console.warn(`Invalid theme mode: ${newMode}`);
      return;
    }

    setThemeModeState(newMode);
    setStoredTheme(newMode);
  };

  /**
   * Toggles between light and dark themes
   */
  const toggleTheme = () => {
    const newMode = isDark ? THEME_MODES.LIGHT : THEME_MODES.DARK;
    setThemeMode(newMode);
  };

  // Apply theme on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply theme whenever it changes
  useEffect(() => {
    if (!mounted) return;

    // Add transition class for smooth theme switching
    if (enableTransitions) {
      document.documentElement.classList.add('theme-transition');
    }

    // Apply theme
    applyThemeToDocument(isDark);
    applyThemeCSSVariables(theme);

    // Remove transition class after transition completes
    if (enableTransitions) {
      const timer = setTimeout(() => {
        document.documentElement.classList.remove('theme-transition');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [theme, isDark, mounted, enableTransitions]);

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (themeMode !== THEME_MODES.SYSTEM) return;
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      // Force re-render when system theme changes
      setThemeModeState(THEME_MODES.SYSTEM);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Older browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [themeMode]);

  // Context value
  const contextValue = useMemo(
    () => ({
      theme,
      themeMode,
      isDark,
      setThemeMode,
      toggleTheme,
    }),
    [theme, themeMode, isDark]
  );

  // Don't render children until mounted (prevents flash)
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// =============================================================================
// THEME HOOK
// =============================================================================

/**
 * Custom hook for accessing theme context
 *
 * @returns {object} Theme context
 * @returns {object} return.theme - Current theme object
 * @returns {string} return.themeMode - Current theme mode ('light', 'dark', or 'system')
 * @returns {boolean} return.isDark - Whether dark theme is active
 * @returns {function} return.setThemeMode - Function to set theme mode
 * @returns {function} return.toggleTheme - Function to toggle between light and dark
 *
 * @throws {Error} If used outside ThemeProvider
 *
 * @example
 * ```jsx
 * function MyComponent() {
 *   const { theme, isDark, toggleTheme } = useTheme();
 *
 *   return (
 *     <div style={{ background: theme.colors.background }}>
 *       <button onClick={toggleTheme}>
 *         {isDark ? 'Light Mode' : 'Dark Mode'}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

// =============================================================================
// THEME UTILITIES
// =============================================================================

/**
 * Hook to detect if user prefers dark mode
 * @returns {boolean} Whether user prefers dark mode
 */
export function usePrefersDark() {
  const [prefersDark, setPrefersDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      setPrefersDark(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return prefersDark;
}

/**
 * Hook to get the current system theme
 * @returns {string} Current system theme ('light' or 'dark')
 */
export function useSystemTheme() {
  const [systemTheme, setSystemTheme] = useState(() => getSystemTheme());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      setSystemTheme(getSystemTheme());
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return systemTheme;
}

// =============================================================================
// EXPORTS
// =============================================================================

export { THEME_MODES };
export default ThemeProvider;

/**
 * CSS to add to your global styles for smooth transitions:
 *
 * ```css
 * .theme-transition,
 * .theme-transition *,
 * .theme-transition *::before,
 * .theme-transition *::after {
 *   transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
 * }
 * ```
 */
