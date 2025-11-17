/**
 * Accessibility Utilities for WCAG 2.1 Compliance
 */

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message, priority = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Trap focus within a modal or dialog
 */
export function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];
  
  function handleTabKey(e) {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  }
  
  element.addEventListener('keydown', handleTabKey);
  
  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * Generate unique ID for ARIA relationships
 */
let idCounter = 0;
export function generateA11yId(prefix = 'a11y') {
  return prefix + '-' + idCounter++ + '-' + Date.now();
}

/**
 * Keyboard navigation helpers
 */
export const KeyCodes = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  TAB: 'Tab',
  HOME: 'Home',
  END: 'End',
};

/**
 * Detect if user prefers reduced motion
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Create live region for dynamic content updates
 */
export function createLiveRegion(type = 'polite') {
  const region = document.createElement('div');
  region.setAttribute('role', type === 'alert' ? 'alert' : 'status');
  region.setAttribute('aria-live', type);
  region.setAttribute('aria-atomic', 'true');
  region.className = 'sr-only';
  
  document.body.appendChild(region);
  
  return {
    announce: (message) => {
      region.textContent = message;
    },
    destroy: () => {
      document.body.removeChild(region);
    },
  };
}
