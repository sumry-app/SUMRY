import { motion } from 'framer-motion';

/**
 * MicroInteractions - Reusable animation patterns
 *
 * Inspired by: Apple, Claude, Linear
 * Provides consistent, delightful micro-interactions throughout the app
 */

// ============================================================================
// Timing Functions (Bezier curves)
// ============================================================================

export const easings = {
  // Apple's standard easing
  appleEase: [0.4, 0, 0.2, 1],

  // Sharp entrance, gentle exit
  sharpEase: [0.4, 0, 0.6, 1],

  // Smooth, natural motion
  smooth: [0.16, 1, 0.3, 1],

  // Bounce effect
  bounce: [0.68, -0.55, 0.265, 1.55],

  // Spring-like
  spring: [0.175, 0.885, 0.32, 1.275],

  // Standard CSS easing
  ease: [0.25, 0.1, 0.25, 1],
  easeIn: [0.42, 0, 1, 1],
  easeOut: [0, 0, 0.58, 1],
  easeInOut: [0.42, 0, 0.58, 1]
};

// ============================================================================
// Common Animation Variants
// ============================================================================

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2, ease: easings.smooth }
};

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.3, ease: easings.smooth }
};

export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: easings.smooth }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.2, ease: easings.smooth }
};

export const slideInRight = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 },
  transition: { duration: 0.3, ease: easings.smooth }
};

export const slideInLeft = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
  transition: { duration: 0.3, ease: easings.smooth }
};

// Stagger children animation
export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: easings.smooth }
  }
};

// ============================================================================
// Hover/Tap Interactions
// ============================================================================

export const hoverScale = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { type: 'spring', stiffness: 400, damping: 17 }
};

export const hoverLift = {
  whileHover: { y: -4, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)' },
  whileTap: { y: 0 },
  transition: { duration: 0.2, ease: easings.smooth }
};

export const hoverGlow = {
  whileHover: { boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)' },
  transition: { duration: 0.2 }
};

export const buttonPress = {
  whileTap: { scale: 0.98 },
  transition: { duration: 0.1 }
};

export const gentleHover = {
  whileHover: { scale: 1.02 },
  transition: { duration: 0.2, ease: easings.smooth }
};

// ============================================================================
// Specialized Interactions
// ============================================================================

// Success checkmark animation
export const successCheck = {
  initial: { pathLength: 0, opacity: 0 },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: easings.smooth }
  }
};

// Error shake
export const errorShake = {
  animate: {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.4 }
  }
};

// Pulse (for notifications)
export const pulse = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: easings.smooth
    }
  }
};

// Shimmer (for loading)
export const shimmer = {
  animate: {
    x: ['-100%', '100%'],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Bounce in
export const bounceIn = {
  initial: { opacity: 0, scale: 0.3 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20
    }
  }
};

// Slide and fade
export const slideAndFade = (direction = 'up') => {
  const directions = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 }
  };

  return {
    initial: { opacity: 0, ...directions[direction] },
    animate: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, ...directions[direction] },
    transition: { duration: 0.3, ease: easings.smooth }
  };
};

// ============================================================================
// Spring Configurations
// ============================================================================

export const springs = {
  // Gentle, slow spring
  gentle: {
    type: 'spring',
    stiffness: 200,
    damping: 20
  },

  // Quick, snappy spring
  snappy: {
    type: 'spring',
    stiffness: 400,
    damping: 25
  },

  // Bouncy spring
  bouncy: {
    type: 'spring',
    stiffness: 300,
    damping: 10
  },

  // Stiff, minimal bounce
  stiff: {
    type: 'spring',
    stiffness: 500,
    damping: 30
  }
};

// ============================================================================
// Page Transitions
// ============================================================================

export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: {
    duration: 0.3,
    ease: easings.smooth
  }
};

export const modalTransition = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 },
  transition: {
    duration: 0.2,
    ease: easings.smooth
  }
};

export const drawerTransition = (side = 'right') => {
  const slides = {
    right: { x: '100%' },
    left: { x: '-100%' },
    top: { y: '-100%' },
    bottom: { y: '100%' }
  };

  return {
    initial: slides[side],
    animate: { x: 0, y: 0 },
    exit: slides[side],
    transition: {
      duration: 0.3,
      ease: easings.smooth
    }
  };
};

// ============================================================================
// List Animations
// ============================================================================

export const listContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

export const listItem = {
  hidden: { opacity: 0, x: -20 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: easings.smooth
    }
  }
};

// ============================================================================
// Interactive Elements
// ============================================================================

// Card interactions
export const cardInteraction = {
  rest: {
    scale: 1,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
  },
  hover: {
    scale: 1.02,
    boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.2)',
    transition: {
      duration: 0.2,
      ease: easings.smooth
    }
  },
  tap: {
    scale: 0.98
  }
};

// Button interactions
export const buttonInteraction = {
  rest: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: easings.smooth
    }
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1
    }
  }
};

// Icon button (smaller scale changes)
export const iconButtonInteraction = {
  rest: { scale: 1, rotate: 0 },
  hover: {
    scale: 1.1,
    transition: {
      duration: 0.2,
      ease: easings.smooth
    }
  },
  tap: {
    scale: 0.9,
    rotate: 5
  }
};

// Toggle switch
export const toggleInteraction = {
  off: { x: 0 },
  on: { x: 20 },
  transition: springs.snappy
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Creates a delayed animation
 */
export const withDelay = (animation, delay = 0) => ({
  ...animation,
  transition: {
    ...animation.transition,
    delay
  }
});

/**
 * Creates a stagger effect for multiple items
 */
export const createStagger = (baseDelay = 0.1, maxDelay = 1) => ({
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: baseDelay,
        delayChildren: 0,
        staggerDirection: 1
      }
    }
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: easings.smooth
      }
    }
  }
});

/**
 * Creates a smooth transition between states
 */
export const createTransition = (duration = 0.3, ease = easings.smooth) => ({
  duration,
  ease
});

// ============================================================================
// Export all
// ============================================================================

export default {
  easings,
  fadeIn,
  fadeInUp,
  fadeInDown,
  scaleIn,
  slideInRight,
  slideInLeft,
  staggerContainer,
  staggerItem,
  hoverScale,
  hoverLift,
  hoverGlow,
  buttonPress,
  gentleHover,
  successCheck,
  errorShake,
  pulse,
  shimmer,
  bounceIn,
  slideAndFade,
  springs,
  pageTransition,
  modalTransition,
  drawerTransition,
  listContainer,
  listItem,
  cardInteraction,
  buttonInteraction,
  iconButtonInteraction,
  toggleInteraction,
  withDelay,
  createStagger,
  createTransition
};
