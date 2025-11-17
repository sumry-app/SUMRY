/**
 * SUMRY Design System - Design Tokens
 *
 * Complete design tokens for consistent theming across the application.
 * Includes colors, typography, spacing, shadows, animations, and more.
 *
 * @module designTokens
 */

// =============================================================================
// COLOR PALETTE
// =============================================================================

/**
 * Base color palette with semantic naming
 * Colors are defined in HSL format for easy manipulation
 */
const colors = {
  // Primary brand colors - Professional blue palette
  primary: {
    50: 'hsl(210, 100%, 97%)',
    100: 'hsl(210, 95%, 92%)',
    200: 'hsl(210, 90%, 85%)',
    300: 'hsl(210, 85%, 75%)',
    400: 'hsl(210, 80%, 65%)',
    500: 'hsl(210, 75%, 55%)', // Main primary color
    600: 'hsl(210, 70%, 45%)',
    700: 'hsl(210, 65%, 35%)',
    800: 'hsl(210, 60%, 25%)',
    900: 'hsl(210, 55%, 15%)',
    950: 'hsl(210, 50%, 10%)',
  },

  // Success colors - Green palette
  success: {
    50: 'hsl(142, 76%, 96%)',
    100: 'hsl(142, 71%, 91%)',
    200: 'hsl(142, 66%, 82%)',
    300: 'hsl(142, 61%, 70%)',
    400: 'hsl(142, 56%, 58%)',
    500: 'hsl(142, 51%, 46%)', // Main success color
    600: 'hsl(142, 56%, 38%)',
    700: 'hsl(142, 61%, 30%)',
    800: 'hsl(142, 66%, 24%)',
    900: 'hsl(142, 71%, 20%)',
    950: 'hsl(142, 76%, 12%)',
  },

  // Warning colors - Amber palette
  warning: {
    50: 'hsl(48, 100%, 96%)',
    100: 'hsl(48, 96%, 89%)',
    200: 'hsl(48, 92%, 78%)',
    300: 'hsl(48, 88%, 65%)',
    400: 'hsl(48, 84%, 52%)',
    500: 'hsl(38, 92%, 50%)', // Main warning color
    600: 'hsl(32, 95%, 45%)',
    700: 'hsl(26, 90%, 37%)',
    800: 'hsl(22, 82%, 30%)',
    900: 'hsl(21, 77%, 26%)',
    950: 'hsl(20, 70%, 15%)',
  },

  // Error colors - Red palette
  error: {
    50: 'hsl(0, 86%, 97%)',
    100: 'hsl(0, 82%, 94%)',
    200: 'hsl(0, 78%, 88%)',
    300: 'hsl(0, 74%, 80%)',
    400: 'hsl(0, 70%, 70%)',
    500: 'hsl(0, 66%, 60%)', // Main error color
    600: 'hsl(0, 72%, 51%)',
    700: 'hsl(0, 74%, 42%)',
    800: 'hsl(0, 76%, 35%)',
    900: 'hsl(0, 78%, 30%)',
    950: 'hsl(0, 80%, 20%)',
  },

  // Info colors - Cyan palette
  info: {
    50: 'hsl(189, 94%, 95%)',
    100: 'hsl(189, 90%, 88%)',
    200: 'hsl(189, 86%, 76%)',
    300: 'hsl(189, 82%, 64%)',
    400: 'hsl(189, 78%, 52%)',
    500: 'hsl(189, 74%, 42%)', // Main info color
    600: 'hsl(189, 80%, 34%)',
    700: 'hsl(189, 86%, 27%)',
    800: 'hsl(189, 90%, 22%)',
    900: 'hsl(189, 94%, 18%)',
    950: 'hsl(189, 98%, 12%)',
  },

  // Neutral/Gray palette - Used for text, backgrounds, borders
  neutral: {
    0: 'hsl(0, 0%, 100%)',      // Pure white
    50: 'hsl(210, 20%, 98%)',
    100: 'hsl(210, 18%, 96%)',
    200: 'hsl(210, 16%, 93%)',
    300: 'hsl(210, 14%, 89%)',
    400: 'hsl(210, 12%, 84%)',
    500: 'hsl(210, 10%, 71%)',
    600: 'hsl(210, 12%, 55%)',
    700: 'hsl(210, 14%, 39%)',
    800: 'hsl(210, 16%, 25%)',
    900: 'hsl(210, 18%, 12%)',
    950: 'hsl(210, 20%, 6%)',
    1000: 'hsl(0, 0%, 0%)',     // Pure black
  },
};

// =============================================================================
// TYPOGRAPHY
// =============================================================================

/**
 * Typography system including font families, sizes, weights, and line heights
 */
export const typography = {
  // Font families
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
    mono: 'Consolas, Monaco, "Courier New", monospace',
    display: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },

  // Font sizes with corresponding line heights
  fontSize: {
    xs: {
      size: '0.75rem',      // 12px
      lineHeight: '1rem',   // 16px
    },
    sm: {
      size: '0.875rem',     // 14px
      lineHeight: '1.25rem', // 20px
    },
    base: {
      size: '1rem',         // 16px
      lineHeight: '1.5rem', // 24px
    },
    lg: {
      size: '1.125rem',     // 18px
      lineHeight: '1.75rem', // 28px
    },
    xl: {
      size: '1.25rem',      // 20px
      lineHeight: '1.75rem', // 28px
    },
    '2xl': {
      size: '1.5rem',       // 24px
      lineHeight: '2rem',   // 32px
    },
    '3xl': {
      size: '1.875rem',     // 30px
      lineHeight: '2.25rem', // 36px
    },
    '4xl': {
      size: '2.25rem',      // 36px
      lineHeight: '2.5rem', // 40px
    },
    '5xl': {
      size: '3rem',         // 48px
      lineHeight: '1',      // 48px
    },
    '6xl': {
      size: '3.75rem',      // 60px
      lineHeight: '1',      // 60px
    },
    '7xl': {
      size: '4.5rem',       // 72px
      lineHeight: '1',      // 72px
    },
  },

  // Font weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

// =============================================================================
// SPACING SCALE
// =============================================================================

/**
 * Consistent spacing scale based on 4px grid
 */
export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem',      // 384px
};

// =============================================================================
// SHADOWS
// =============================================================================

/**
 * Shadow system including standard shadows and glow effects
 */
export const shadows = {
  // Standard shadows
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',

  // Glow effects for primary actions
  glow: {
    primary: {
      sm: '0 0 10px rgba(59, 130, 246, 0.5)',
      md: '0 0 20px rgba(59, 130, 246, 0.5)',
      lg: '0 0 30px rgba(59, 130, 246, 0.5)',
    },
    success: {
      sm: '0 0 10px rgba(34, 197, 94, 0.5)',
      md: '0 0 20px rgba(34, 197, 94, 0.5)',
      lg: '0 0 30px rgba(34, 197, 94, 0.5)',
    },
    warning: {
      sm: '0 0 10px rgba(251, 191, 36, 0.5)',
      md: '0 0 20px rgba(251, 191, 36, 0.5)',
      lg: '0 0 30px rgba(251, 191, 36, 0.5)',
    },
    error: {
      sm: '0 0 10px rgba(239, 68, 68, 0.5)',
      md: '0 0 20px rgba(239, 68, 68, 0.5)',
      lg: '0 0 30px rgba(239, 68, 68, 0.5)',
    },
  },

  // Card shadows for different elevations
  card: {
    flat: '0 0 0 1px rgba(0, 0, 0, 0.05)',
    raised: '0 2px 4px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
    floating: '0 4px 8px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
    elevated: '0 8px 16px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.05)',
  },
};

// =============================================================================
// BORDER RADIUS
// =============================================================================

/**
 * Border radius scale for consistent rounded corners
 */
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',   // Fully rounded
};

// =============================================================================
// TRANSITIONS & ANIMATIONS
// =============================================================================

/**
 * Transition and animation configurations
 */
export const transitions = {
  // Duration presets
  duration: {
    fastest: '75ms',
    faster: '100ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
    slowest: '700ms',
  },

  // Timing functions (easing)
  timing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    bounce: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
  },

  // Common transition presets
  preset: {
    default: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    fast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    colors: 'color 200ms cubic-bezier(0.4, 0, 0.2, 1), background-color 200ms cubic-bezier(0.4, 0, 0.2, 1), border-color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// Animation keyframes
export const animations = {
  // Spin animation
  spin: {
    name: 'spin',
    keyframes: {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' },
    },
    duration: '1s',
    timing: 'linear',
    iteration: 'infinite',
  },

  // Pulse animation
  pulse: {
    name: 'pulse',
    keyframes: {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.5 },
    },
    duration: '2s',
    timing: 'cubic-bezier(0.4, 0, 0.6, 1)',
    iteration: 'infinite',
  },

  // Bounce animation
  bounce: {
    name: 'bounce',
    keyframes: {
      '0%, 100%': {
        transform: 'translateY(-25%)',
        animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
      },
      '50%': {
        transform: 'translateY(0)',
        animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
      },
    },
    duration: '1s',
    timing: 'linear',
    iteration: 'infinite',
  },

  // Fade in animation
  fadeIn: {
    name: 'fadeIn',
    keyframes: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    duration: '300ms',
    timing: 'ease-out',
    iteration: '1',
  },

  // Slide in from bottom
  slideInBottom: {
    name: 'slideInBottom',
    keyframes: {
      from: {
        transform: 'translateY(100%)',
        opacity: 0,
      },
      to: {
        transform: 'translateY(0)',
        opacity: 1,
      },
    },
    duration: '300ms',
    timing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    iteration: '1',
  },

  // Scale in animation
  scaleIn: {
    name: 'scaleIn',
    keyframes: {
      from: {
        transform: 'scale(0.95)',
        opacity: 0,
      },
      to: {
        transform: 'scale(1)',
        opacity: 1,
      },
    },
    duration: '200ms',
    timing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    iteration: '1',
  },

  // Shake animation for errors
  shake: {
    name: 'shake',
    keyframes: {
      '0%, 100%': { transform: 'translateX(0)' },
      '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
      '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
    },
    duration: '500ms',
    timing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    iteration: '1',
  },
};

// =============================================================================
// BREAKPOINTS
// =============================================================================

/**
 * Responsive breakpoints for different screen sizes
 */
export const breakpoints = {
  xs: '320px',   // Mobile small
  sm: '640px',   // Mobile
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px', // Extra large desktop
};

// =============================================================================
// Z-INDEX SCALE
// =============================================================================

/**
 * Z-index scale for managing layer stacking
 */
export const zIndex = {
  auto: 'auto',
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  notification: 1080,
  toast: 1090,
};

// =============================================================================
// GLASSMORPHISM STYLES
// =============================================================================

/**
 * Glassmorphism effect presets
 */
export const glassmorphism = {
  light: {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
  },
  medium: {
    background: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(16px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  },
  dark: {
    background: 'rgba(17, 25, 40, 0.7)',
    backdropFilter: 'blur(16px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.125)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
  },
};

// =============================================================================
// THEME CONFIGURATIONS
// =============================================================================

/**
 * Light theme configuration
 */
export const lightTheme = {
  name: 'light',
  colors: {
    // Brand colors
    primary: colors.primary[500],
    primaryHover: colors.primary[600],
    primaryActive: colors.primary[700],
    primaryLight: colors.primary[100],
    primaryDark: colors.primary[900],

    // Semantic colors
    success: colors.success[500],
    successHover: colors.success[600],
    successLight: colors.success[100],

    warning: colors.warning[500],
    warningHover: colors.warning[600],
    warningLight: colors.warning[100],

    error: colors.error[500],
    errorHover: colors.error[600],
    errorLight: colors.error[100],

    info: colors.info[500],
    infoHover: colors.info[600],
    infoLight: colors.info[100],

    // Neutral colors
    background: colors.neutral[0],
    backgroundSecondary: colors.neutral[50],
    backgroundTertiary: colors.neutral[100],

    surface: colors.neutral[0],
    surfaceHover: colors.neutral[50],

    border: colors.neutral[200],
    borderHover: colors.neutral[300],

    text: colors.neutral[900],
    textSecondary: colors.neutral[700],
    textTertiary: colors.neutral[600],
    textDisabled: colors.neutral[400],

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.1)',
  },
  shadows: {
    ...shadows,
  },
};

/**
 * Dark theme configuration
 */
export const darkTheme = {
  name: 'dark',
  colors: {
    // Brand colors
    primary: colors.primary[400],
    primaryHover: colors.primary[300],
    primaryActive: colors.primary[500],
    primaryLight: colors.primary[900],
    primaryDark: colors.primary[100],

    // Semantic colors
    success: colors.success[400],
    successHover: colors.success[300],
    successLight: colors.success[900],

    warning: colors.warning[400],
    warningHover: colors.warning[300],
    warningLight: colors.warning[900],

    error: colors.error[400],
    errorHover: colors.error[300],
    errorLight: colors.error[900],

    info: colors.info[400],
    infoHover: colors.info[300],
    infoLight: colors.info[900],

    // Neutral colors
    background: colors.neutral[950],
    backgroundSecondary: colors.neutral[900],
    backgroundTertiary: colors.neutral[800],

    surface: colors.neutral[900],
    surfaceHover: colors.neutral[800],

    border: colors.neutral[700],
    borderHover: colors.neutral[600],

    text: colors.neutral[50],
    textSecondary: colors.neutral[300],
    textTertiary: colors.neutral[400],
    textDisabled: colors.neutral[600],

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.75)',
    overlayLight: 'rgba(0, 0, 0, 0.25)',
  },
  shadows: {
    ...shadows,
    // Enhance shadows for dark theme
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
  },
};

// =============================================================================
// COMPONENT-SPECIFIC TOKENS
// =============================================================================

/**
 * Component-specific design tokens
 */
export const components = {
  // Button tokens
  button: {
    height: {
      sm: spacing[8],
      md: spacing[10],
      lg: spacing[12],
    },
    padding: {
      sm: `${spacing[2]} ${spacing[3]}`,
      md: `${spacing[2.5]} ${spacing[4]}`,
      lg: `${spacing[3]} ${spacing[6]}`,
    },
    fontSize: {
      sm: typography.fontSize.sm.size,
      md: typography.fontSize.base.size,
      lg: typography.fontSize.lg.size,
    },
    borderRadius: borderRadius.md,
    transition: transitions.preset.default,
  },

  // Input tokens
  input: {
    height: {
      sm: spacing[8],
      md: spacing[10],
      lg: spacing[12],
    },
    padding: `${spacing[2]} ${spacing[3]}`,
    fontSize: typography.fontSize.sm.size,
    borderRadius: borderRadius.md,
    borderWidth: '1px',
    transition: transitions.preset.default,
  },

  // Card tokens
  card: {
    padding: {
      sm: spacing[4],
      md: spacing[6],
      lg: spacing[8],
    },
    borderRadius: borderRadius.lg,
    shadow: shadows.card.raised,
  },

  // Modal tokens
  modal: {
    backdropBlur: '4px',
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    maxWidth: {
      sm: '28rem',
      md: '32rem',
      lg: '48rem',
      xl: '64rem',
    },
  },

  // Toast tokens
  toast: {
    width: '22rem',
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    shadow: shadows.lg,
  },

  // Tooltip tokens
  tooltip: {
    padding: `${spacing[2]} ${spacing[3]}`,
    fontSize: typography.fontSize.sm.size,
    borderRadius: borderRadius.md,
    maxWidth: '20rem',
  },
};

// =============================================================================
// EXPORTS
// =============================================================================

/**
 * Complete design tokens export
 */
export const designTokens = {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
  transitions,
  animations,
  breakpoints,
  zIndex,
  glassmorphism,
  lightTheme,
  darkTheme,
  components,
};

export default designTokens;
