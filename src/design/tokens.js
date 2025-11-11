/**
 * SUMRY Design System
 * World-class design tokens inspired by Apple, Claude, and OpenAI
 */

export const designTokens = {
  // Color System - Carefully crafted for accessibility and beauty
  colors: {
    // Primary Brand Colors
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',  // Main brand
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554'
    },

    // Accent Colors - Warm, inviting
    accent: {
      coral: '#ff6b6b',
      sunset: '#ffa07a',
      gold: '#ffd93d',
      mint: '#6bcf7f',
      lavender: '#c77dff',
      sky: '#4ecdc4'
    },

    // Semantic Colors
    success: {
      light: '#d1fae5',
      DEFAULT: '#10b981',
      dark: '#047857'
    },
    warning: {
      light: '#fef3c7',
      DEFAULT: '#f59e0b',
      dark: '#d97706'
    },
    error: {
      light: '#fee2e2',
      DEFAULT: '#ef4444',
      dark: '#dc2626'
    },
    info: {
      light: '#dbeafe',
      DEFAULT: '#3b82f6',
      dark: '#1d4ed8'
    },

    // Neutral Palette - Rich grays
    neutral: {
      0: '#ffffff',
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      950: '#0a0a0a'
    }
  },

  // Typography System
  typography: {
    fonts: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
      display: '"Inter", -apple-system, sans-serif'
    },

    sizes: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
      '6xl': '3.75rem',  // 60px
      '7xl': '4.5rem'    // 72px
    },

    weights: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800'
    },

    lineHeights: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2'
    },

    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em'
    }
  },

  // Spacing System - Consistent rhythm
  spacing: {
    px: '1px',
    0: '0',
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
    96: '24rem'       // 384px
  },

  // Border Radius - Soft, modern curves
  radius: {
    none: '0',
    sm: '0.25rem',    // 4px
    DEFAULT: '0.5rem', // 8px
    md: '0.625rem',   // 10px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.25rem', // 20px
    '3xl': '1.5rem',  // 24px
    full: '9999px'
  },

  // Shadows - Depth and elevation
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    glow: '0 0 20px rgb(59 130 246 / 0.5)',
    glowLarge: '0 0 40px rgb(59 130 246 / 0.4)'
  },

  // Animation Timings - Smooth and natural
  transitions: {
    duration: {
      fastest: '100ms',
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      slower: '500ms',
      slowest: '700ms'
    },
    timing: {
      ease: 'ease',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    }
  },

  // Z-Index Scale - Layer management
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1080,
    max: 9999
  },

  // Breakpoints - Responsive design
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  }
};

// Component Variants
export const componentStyles = {
  button: {
    primary: {
      bg: designTokens.colors.primary[600],
      hover: designTokens.colors.primary[700],
      active: designTokens.colors.primary[800],
      text: designTokens.colors.neutral[0]
    },
    secondary: {
      bg: designTokens.colors.neutral[100],
      hover: designTokens.colors.neutral[200],
      active: designTokens.colors.neutral[300],
      text: designTokens.colors.neutral[900]
    },
    ghost: {
      bg: 'transparent',
      hover: designTokens.colors.neutral[100],
      active: designTokens.colors.neutral[200],
      text: designTokens.colors.neutral[700]
    }
  },

  card: {
    elevated: {
      bg: designTokens.colors.neutral[0],
      shadow: designTokens.shadows.lg,
      border: 'none',
      radius: designTokens.radius['2xl']
    },
    flat: {
      bg: designTokens.colors.neutral[50],
      shadow: 'none',
      border: `1px solid ${designTokens.colors.neutral[200]}`,
      radius: designTokens.radius.xl
    },
    glass: {
      bg: 'rgba(255, 255, 255, 0.7)',
      backdrop: 'blur(12px)',
      shadow: designTokens.shadows.md,
      border: '1px solid rgba(255, 255, 255, 0.3)',
      radius: designTokens.radius['2xl']
    }
  }
};

// Animation Presets
export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
  },

  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },

  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },

  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2, ease: 'easeOut' }
  },

  shimmer: {
    animate: {
      backgroundPosition: ['200% 0', '-200% 0']
    },
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

export default designTokens;
