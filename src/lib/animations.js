/**
 * SUMRY Design System - Animation Library
 *
 * Comprehensive animation library with:
 * - Micro-interactions (hover, click, focus)
 * - Page transitions
 * - Loading animations
 * - Success/error animations
 * - Skeleton loaders
 * - Stagger animations
 * - Spring animations
 *
 * @module animations
 */

import { transitions } from '@/styles/designTokens';

// =============================================================================
// ANIMATION VARIANTS (for Framer Motion if needed)
// =============================================================================

/**
 * Fade animation variants
 */
export const fadeVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
};

/**
 * Slide in from bottom variants
 */
export const slideUpVariants = {
  initial: {
    y: 20,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
  },
  exit: {
    y: -20,
    opacity: 0,
  },
};

/**
 * Slide in from top variants
 */
export const slideDownVariants = {
  initial: {
    y: -20,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
  },
  exit: {
    y: 20,
    opacity: 0,
  },
};

/**
 * Slide in from left variants
 */
export const slideLeftVariants = {
  initial: {
    x: -20,
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
  },
  exit: {
    x: 20,
    opacity: 0,
  },
};

/**
 * Slide in from right variants
 */
export const slideRightVariants = {
  initial: {
    x: 20,
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
  },
  exit: {
    x: -20,
    opacity: 0,
  },
};

/**
 * Scale animation variants
 */
export const scaleVariants = {
  initial: {
    scale: 0.9,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
  },
  exit: {
    scale: 0.9,
    opacity: 0,
  },
};

/**
 * Pop animation variants (scale with spring)
 */
export const popVariants = {
  initial: {
    scale: 0.8,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 25,
    },
  },
  exit: {
    scale: 0.8,
    opacity: 0,
  },
};

/**
 * Rotate and scale variants
 */
export const rotateScaleVariants = {
  initial: {
    scale: 0,
    rotate: -180,
    opacity: 0,
  },
  animate: {
    scale: 1,
    rotate: 0,
    opacity: 1,
  },
  exit: {
    scale: 0,
    rotate: 180,
    opacity: 0,
  },
};

// =============================================================================
// MICRO-INTERACTIONS
// =============================================================================

/**
 * Hover animations
 */
export const hoverAnimations = {
  // Lift effect
  lift: {
    whileHover: {
      y: -2,
      transition: { duration: 0.2 },
    },
  },

  // Scale up
  scaleUp: {
    whileHover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
  },

  // Glow effect
  glow: {
    whileHover: {
      boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
      transition: { duration: 0.2 },
    },
  },

  // Brightness increase
  brighten: {
    whileHover: {
      filter: 'brightness(1.1)',
      transition: { duration: 0.2 },
    },
  },

  // Rotate slightly
  tilt: {
    whileHover: {
      rotate: 2,
      transition: { duration: 0.2 },
    },
  },
};

/**
 * Click/tap animations
 */
export const tapAnimations = {
  // Scale down
  scaleDown: {
    whileTap: {
      scale: 0.95,
    },
  },

  // Scale down more
  press: {
    whileTap: {
      scale: 0.9,
    },
  },

  // Bounce
  bounce: {
    whileTap: {
      scale: 0.9,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10,
      },
    },
  },
};

/**
 * Focus animations
 */
export const focusAnimations = {
  // Ring effect
  ring: {
    whileFocus: {
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.5)',
      transition: { duration: 0.2 },
    },
  },

  // Glow effect
  glow: {
    whileFocus: {
      boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
      transition: { duration: 0.2 },
    },
  },
};

/**
 * Combined micro-interactions for buttons
 */
export const buttonAnimations = {
  default: {
    ...hoverAnimations.lift,
    ...tapAnimations.scaleDown,
  },
  scale: {
    ...hoverAnimations.scaleUp,
    ...tapAnimations.press,
  },
  glow: {
    ...hoverAnimations.glow,
    ...tapAnimations.scaleDown,
  },
};

// =============================================================================
// PAGE TRANSITIONS
// =============================================================================

/**
 * Page transition variants
 */
export const pageTransitions = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  },

  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeInOut' },
  },

  slideRight: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 20, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeInOut' },
  },

  scale: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.05, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeInOut' },
  },
};

// =============================================================================
// LOADING ANIMATIONS
// =============================================================================

/**
 * Spinner animation variants
 */
export const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

/**
 * Pulse animation variants
 */
export const pulseVariants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * Dots animation variants (for loading dots)
 */
export const dotsVariants = {
  container: {
    animate: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  },
  dot: {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  },
};

/**
 * Progress bar animation variants
 */
export const progressVariants = {
  initial: {
    width: '0%',
  },
  animate: (progress) => ({
    width: `${progress}%`,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  }),
};

// =============================================================================
// SUCCESS/ERROR ANIMATIONS
// =============================================================================

/**
 * Success checkmark animation
 */
export const successCheckVariants = {
  initial: {
    pathLength: 0,
    opacity: 0,
  },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
};

/**
 * Error cross animation
 */
export const errorCrossVariants = {
  initial: {
    pathLength: 0,
    opacity: 0,
  },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: 'easeInOut',
    },
  },
};

/**
 * Shake animation for errors
 */
export const shakeVariants = {
  animate: {
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
    },
  },
};

/**
 * Success scale and fade
 */
export const successVariants = {
  initial: {
    scale: 0.8,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 25,
    },
  },
};

// =============================================================================
// SKELETON LOADERS
// =============================================================================

/**
 * Skeleton shimmer animation
 */
export const skeletonVariants = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

/**
 * Skeleton pulse animation
 */
export const skeletonPulseVariants = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// =============================================================================
// STAGGER ANIMATIONS
// =============================================================================

/**
 * Container variants for stagger animations
 */
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

/**
 * Fast stagger container
 */
export const fastStaggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

/**
 * Slow stagger container
 */
export const slowStaggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

/**
 * Stagger item variants
 */
export const staggerItem = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
};

/**
 * Stagger fade item
 */
export const staggerFadeItem = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

/**
 * Stagger scale item
 */
export const staggerScaleItem = {
  initial: {
    opacity: 0,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    scale: 1,
  },
};

// =============================================================================
// SPRING ANIMATIONS
// =============================================================================

/**
 * Spring animation presets
 */
export const springPresets = {
  // Gentle spring
  gentle: {
    type: 'spring',
    stiffness: 120,
    damping: 20,
  },

  // Bouncy spring
  bouncy: {
    type: 'spring',
    stiffness: 400,
    damping: 10,
  },

  // Stiff spring
  stiff: {
    type: 'spring',
    stiffness: 500,
    damping: 30,
  },

  // Slow spring
  slow: {
    type: 'spring',
    stiffness: 80,
    damping: 20,
  },

  // Wobbly spring
  wobbly: {
    type: 'spring',
    stiffness: 180,
    damping: 12,
  },
};

// =============================================================================
// MODAL/DIALOG ANIMATIONS
// =============================================================================

/**
 * Modal overlay animation
 */
export const modalOverlayVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Modal content animation
 */
export const modalContentVariants = {
  initial: {
    scale: 0.95,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30,
    },
  },
  exit: {
    scale: 0.95,
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Drawer animation (slide from side)
 */
export const drawerVariants = {
  left: {
    initial: {
      x: '-100%',
    },
    animate: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      x: '-100%',
      transition: {
        duration: 0.2,
      },
    },
  },
  right: {
    initial: {
      x: '100%',
    },
    animate: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      x: '100%',
      transition: {
        duration: 0.2,
      },
    },
  },
  top: {
    initial: {
      y: '-100%',
    },
    animate: {
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      y: '-100%',
      transition: {
        duration: 0.2,
      },
    },
  },
  bottom: {
    initial: {
      y: '100%',
    },
    animate: {
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      y: '100%',
      transition: {
        duration: 0.2,
      },
    },
  },
};

// =============================================================================
// TOAST ANIMATIONS
// =============================================================================

/**
 * Toast notification animations by position
 */
export const toastVariants = {
  'top-right': {
    initial: {
      x: 400,
      opacity: 0,
    },
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 30,
      },
    },
    exit: {
      x: 400,
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  },
  'top-left': {
    initial: {
      x: -400,
      opacity: 0,
    },
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 30,
      },
    },
    exit: {
      x: -400,
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  },
  'bottom-right': {
    initial: {
      x: 400,
      opacity: 0,
    },
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 30,
      },
    },
    exit: {
      x: 400,
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  },
  'bottom-left': {
    initial: {
      x: -400,
      opacity: 0,
    },
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 30,
      },
    },
    exit: {
      x: -400,
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  },
  'top-center': {
    initial: {
      y: -100,
      opacity: 0,
    },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 30,
      },
    },
    exit: {
      y: -100,
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  },
  'bottom-center': {
    initial: {
      y: 100,
      opacity: 0,
    },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 30,
      },
    },
    exit: {
      y: 100,
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  },
};

// =============================================================================
// CSS KEYFRAME ANIMATIONS
// =============================================================================

/**
 * CSS keyframe animations as objects (can be used with styled-components or emotion)
 */
export const cssKeyframes = {
  spin: `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `,

  pulse: `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `,

  bounce: `
    @keyframes bounce {
      0%, 100% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
      }
      50% {
        transform: translateY(0);
        animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
      }
    }
  `,

  shake: `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
      20%, 40%, 60%, 80% { transform: translateX(4px); }
    }
  `,

  slideInBottom: `
    @keyframes slideInBottom {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `,

  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,

  scaleIn: `
    @keyframes scaleIn {
      from {
        transform: scale(0.95);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }
  `,

  shimmer: `
    @keyframes shimmer {
      0% { background-position: -1000px 0; }
      100% { background-position: 1000px 0; }
    }
  `,
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Creates a custom spring animation
 * @param {number} stiffness - Spring stiffness
 * @param {number} damping - Spring damping
 * @returns {object} Spring configuration
 */
export function createSpring(stiffness = 300, damping = 30) {
  return {
    type: 'spring',
    stiffness,
    damping,
  };
}

/**
 * Creates a custom transition
 * @param {number} duration - Duration in seconds
 * @param {string} ease - Easing function
 * @returns {object} Transition configuration
 */
export function createTransition(duration = 0.3, ease = 'easeInOut') {
  return {
    duration,
    ease,
  };
}

/**
 * Applies CSS animation to an element
 * @param {HTMLElement} element - DOM element
 * @param {string} animationName - Animation name
 * @param {number} duration - Duration in ms
 * @param {string} timing - Timing function
 */
export function applyCSSAnimation(
  element,
  animationName,
  duration = 300,
  timing = 'ease-in-out'
) {
  if (!element) return;

  element.style.animation = `${animationName} ${duration}ms ${timing}`;

  return new Promise((resolve) => {
    const handleAnimationEnd = () => {
      element.style.animation = '';
      element.removeEventListener('animationend', handleAnimationEnd);
      resolve();
    };
    element.addEventListener('animationend', handleAnimationEnd);
  });
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  // Variants
  fadeVariants,
  slideUpVariants,
  slideDownVariants,
  slideLeftVariants,
  slideRightVariants,
  scaleVariants,
  popVariants,
  rotateScaleVariants,

  // Micro-interactions
  hoverAnimations,
  tapAnimations,
  focusAnimations,
  buttonAnimations,

  // Page transitions
  pageTransitions,

  // Loading
  spinnerVariants,
  pulseVariants,
  dotsVariants,
  progressVariants,

  // Success/Error
  successCheckVariants,
  errorCrossVariants,
  shakeVariants,
  successVariants,

  // Skeleton
  skeletonVariants,
  skeletonPulseVariants,

  // Stagger
  staggerContainer,
  fastStaggerContainer,
  slowStaggerContainer,
  staggerItem,
  staggerFadeItem,
  staggerScaleItem,

  // Spring
  springPresets,

  // Modal/Dialog
  modalOverlayVariants,
  modalContentVariants,
  drawerVariants,

  // Toast
  toastVariants,

  // CSS Keyframes
  cssKeyframes,

  // Utilities
  createSpring,
  createTransition,
  applyCSSAnimation,
};
