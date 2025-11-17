# SUMRY Design System - Integration Guide

This guide explains how to integrate and use the comprehensive design system for SUMRY.

## Overview

The design system consists of 5 main modules:

1. **Design Tokens** (`src/styles/designTokens.js`) - Core design values
2. **Theme Management** (`src/lib/theme.js`) - Theme switching and context
3. **Animation Library** (`src/lib/animations.js`) - Reusable animations
4. **Toast Notifications** (`src/components/ui/Toast.jsx`) - Notification system
5. **Keyboard Shortcuts** (`src/lib/keyboardShortcuts.js`) - Shortcut management

---

## Quick Start

### 1. Update Your Main App Component

Update your `src/App.jsx` or `src/main.jsx` to include the providers:

```jsx
import { ThemeProvider } from '@/lib/theme';
import { ToastProvider } from '@/components/ui/Toast';
import { KeyboardShortcutsProvider } from '@/lib/keyboardShortcuts';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider position="top-right" max={5}>
        <KeyboardShortcutsProvider>
          {/* Your app content */}
          <YourAppContent />
        </KeyboardShortcutsProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
```

### 2. Add Global CSS for Theme Transitions

Add this to your `src/index.css` or global styles:

```css
/* Theme transition for smooth theme switching */
.theme-transition,
.theme-transition *,
.theme-transition *::before,
.theme-transition *::after {
  transition: background-color 0.3s ease,
              color 0.3s ease,
              border-color 0.3s ease !important;
}

/* CSS Custom Properties will be injected by ThemeProvider */
/* Access them with var(--color-primary), var(--color-background), etc. */
```

---

## Design Tokens Usage

### Importing Tokens

```jsx
import {
  lightTheme,
  darkTheme,
  typography,
  spacing,
  shadows,
  borderRadius,
  transitions,
  animations,
  glassmorphism,
  components
} from '@/styles/designTokens';
```

### Using in Components

```jsx
function MyComponent() {
  const { theme } = useTheme();

  return (
    <div style={{
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
      padding: spacing[4],
      borderRadius: borderRadius.lg,
      boxShadow: shadows.md,
    }}>
      Content
    </div>
  );
}
```

### Using with Tailwind

Update your `tailwind.config.js`:

```js
import {
  spacing,
  shadows,
  borderRadius,
  breakpoints,
  typography
} from './src/styles/designTokens.js';

export default {
  content: ['./src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      spacing,
      boxShadow: shadows,
      borderRadius,
      screens: breakpoints,
      fontFamily: typography.fontFamily,
      fontSize: Object.entries(typography.fontSize).reduce((acc, [key, value]) => {
        acc[key] = [value.size, { lineHeight: value.lineHeight }];
        return acc;
      }, {}),
    },
  },
};
```

---

## Theme Management

### Using the Theme Hook

```jsx
import { useTheme, THEME_MODES } from '@/lib/theme';

function ThemeToggle() {
  const { theme, themeMode, isDark, toggleTheme, setThemeMode } = useTheme();

  return (
    <div>
      {/* Simple toggle */}
      <button onClick={toggleTheme}>
        {isDark ? '🌙 Dark' : '☀️ Light'}
      </button>

      {/* Mode selector */}
      <select
        value={themeMode}
        onChange={(e) => setThemeMode(e.target.value)}
      >
        <option value={THEME_MODES.LIGHT}>Light</option>
        <option value={THEME_MODES.DARK}>Dark</option>
        <option value={THEME_MODES.SYSTEM}>System</option>
      </select>

      {/* Access theme colors */}
      <div style={{ color: theme.colors.primary }}>
        Primary colored text
      </div>
    </div>
  );
}
```

### Theme-Aware Components

```jsx
function Card({ children }) {
  const { theme } = useTheme();

  return (
    <div className="p-6 rounded-lg" style={{
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      boxShadow: theme.shadows.card.raised,
    }}>
      {children}
    </div>
  );
}
```

---

## Animation Library

### Using Animation Variants (with Framer Motion)

First, install Framer Motion if not already installed:

```bash
npm install framer-motion
```

```jsx
import { motion } from 'framer-motion';
import {
  fadeVariants,
  slideUpVariants,
  buttonAnimations,
  modalContentVariants
} from '@/lib/animations';

function AnimatedComponent() {
  return (
    <>
      {/* Fade in animation */}
      <motion.div
        variants={fadeVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        Fades in
      </motion.div>

      {/* Slide up animation */}
      <motion.div
        variants={slideUpVariants}
        initial="initial"
        animate="animate"
      >
        Slides up
      </motion.div>

      {/* Interactive button */}
      <motion.button
        {...buttonAnimations.default}
      >
        Hover and click me
      </motion.button>

      {/* Modal with animation */}
      <motion.div
        variants={modalContentVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        Modal content
      </motion.div>
    </>
  );
}
```

### Stagger Animations

```jsx
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';

function List({ items }) {
  return (
    <motion.ul
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {items.map((item) => (
        <motion.li key={item.id} variants={staggerItem}>
          {item.name}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

### CSS-Only Animations

```jsx
import { applyCSSAnimation } from '@/lib/animations';

function MyComponent() {
  const elementRef = useRef(null);

  const handleClick = async () => {
    await applyCSSAnimation(elementRef.current, 'shake', 500);
    console.log('Animation complete!');
  };

  return (
    <div ref={elementRef} onClick={handleClick}>
      Click to shake
    </div>
  );
}
```

Add the keyframes to your CSS:

```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}
```

---

## Toast Notifications

### Basic Usage

```jsx
import { useToast } from '@/components/ui/Toast';

function MyComponent() {
  const { success, error, warning, info } = useToast();

  const handleSuccess = () => {
    success('Operation completed!');
  };

  const handleError = () => {
    error('Something went wrong!', {
      description: 'Please try again later.',
    });
  };

  const handleWarning = () => {
    warning('Are you sure?', {
      description: 'This action cannot be undone.',
      action: {
        label: 'Undo',
        onClick: () => console.log('Undo clicked'),
      },
    });
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleWarning}>Show Warning</button>
    </div>
  );
}
```

### Advanced Usage

```jsx
function AdvancedToastExample() {
  const toast = useToast();

  // Custom duration
  const showCustomDuration = () => {
    toast.success('Quick message', { duration: 2000 });
  };

  // Persistent toast (no auto-dismiss)
  const showPersistent = () => {
    toast.info('Important notice', {
      description: 'Please read carefully',
      persistent: true,
    });
  };

  // Custom icon
  const showCustomIcon = () => {
    toast.info('Custom icon', {
      icon: CustomIconComponent,
    });
  };

  // Promise toast
  const handleAsyncOperation = async () => {
    const promise = fetch('/api/data').then(res => res.json());

    toast.promise(promise, {
      loading: 'Loading data...',
      success: 'Data loaded successfully!',
      error: 'Failed to load data',
    });
  };

  return (
    <div>
      <button onClick={showCustomDuration}>Quick Toast</button>
      <button onClick={showPersistent}>Persistent Toast</button>
      <button onClick={handleAsyncOperation}>Async Operation</button>
    </div>
  );
}
```

### Toast Configuration

Configure the ToastProvider in your App:

```jsx
<ToastProvider
  position="top-right"  // Position: top-right, top-left, bottom-right, etc.
  max={5}              // Maximum number of toasts
>
  <App />
</ToastProvider>
```

---

## Keyboard Shortcuts

### Basic Setup

```jsx
import { useKeyboardShortcut } from '@/lib/keyboardShortcuts';

function MyComponent() {
  // Register a single shortcut
  useKeyboardShortcut('save', () => {
    console.log('Save triggered!');
    handleSave();
  });

  const handleSave = () => {
    // Your save logic
  };

  return <div>Press Cmd+S (Mac) or Ctrl+S (Windows) to save</div>;
}
```

### Multiple Shortcuts

```jsx
import { useKeyboardShortcutsMap } from '@/lib/keyboardShortcuts';

function Editor() {
  const handleSave = () => console.log('Saving...');
  const handleUndo = () => console.log('Undo...');
  const handleRedo = () => console.log('Redo...');
  const handleSearch = () => console.log('Search...');

  useKeyboardShortcutsMap({
    save: handleSave,
    undo: handleUndo,
    redo: handleRedo,
    search: handleSearch,
  });

  return <div>Editor with keyboard shortcuts</div>;
}
```

### Custom Shortcuts

```jsx
const customShortcuts = {
  exportPDF: {
    keys: ['Cmd+E', 'Ctrl+E'],
    description: 'Export as PDF',
    category: 'Export',
    icon: FileDown,
  },
  print: {
    keys: ['Cmd+P', 'Ctrl+P'],
    description: 'Print document',
    category: 'File',
    icon: Printer,
  },
};

<KeyboardShortcutsProvider shortcuts={customShortcuts}>
  <App />
</KeyboardShortcutsProvider>
```

### Show Shortcuts Help

```jsx
import { useKeyboardShortcuts } from '@/lib/keyboardShortcuts';

function HelpButton() {
  const { setShowHelp } = useKeyboardShortcuts();

  return (
    <button onClick={() => setShowHelp(true)}>
      Show Keyboard Shortcuts
    </button>
  );
}

// Or press ? or Cmd+/ to open help modal
```

---

## Component Examples

### Themed Button Component

```jsx
import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { components } from '@/styles/designTokens';

function ThemedButton({ variant = 'primary', children, ...props }) {
  const { theme } = useTheme();

  const variants = {
    primary: {
      backgroundColor: theme.colors.primary,
      color: 'white',
    },
    secondary: {
      backgroundColor: theme.colors.backgroundSecondary,
      color: theme.colors.text,
      border: `1px solid ${theme.colors.border}`,
    },
  };

  return (
    <button
      className={cn(
        'rounded-lg font-medium transition-all',
        'hover:opacity-90 active:scale-95'
      )}
      style={{
        ...variants[variant],
        padding: components.button.padding.md,
        height: components.button.height.md,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Animated Card Component

```jsx
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme';
import { scaleVariants } from '@/lib/animations';
import { components } from '@/styles/designTokens';

function AnimatedCard({ children, ...props }) {
  const { theme } = useTheme();

  return (
    <motion.div
      variants={scaleVariants}
      initial="initial"
      animate="animate"
      whileHover={{ y: -4 }}
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: components.card.borderRadius,
        padding: components.card.padding.md,
        boxShadow: components.card.shadow,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
```

### Complete Example Component

```jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useToast } from '@/components/ui/Toast';
import { useKeyboardShortcut } from '@/lib/keyboardShortcuts';
import { fadeVariants, buttonAnimations } from '@/lib/animations';

function CompleteExample() {
  const [data, setData] = useState('');
  const { theme, isDark, toggleTheme } = useTheme();
  const { success, error } = useToast();

  const handleSave = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      success('Saved successfully!', {
        description: 'Your changes have been saved.',
      });
    } catch (err) {
      error('Failed to save', {
        description: err.message,
      });
    }
  };

  // Register keyboard shortcut
  useKeyboardShortcut('save', handleSave);

  return (
    <motion.div
      variants={fadeVariants}
      initial="initial"
      animate="animate"
      style={{
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        minHeight: '100vh',
        padding: '2rem',
      }}
    >
      <div style={{
        backgroundColor: theme.colors.surface,
        borderRadius: '1rem',
        padding: '2rem',
        boxShadow: theme.shadows.card.elevated,
      }}>
        <h1 style={{ color: theme.colors.text, marginBottom: '1rem' }}>
          Complete Example
        </h1>

        <textarea
          value={data}
          onChange={(e) => setData(e.target.value)}
          placeholder="Type something..."
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            backgroundColor: theme.colors.backgroundSecondary,
            color: theme.colors.text,
            border: `1px solid ${theme.colors.border}`,
          }}
        />

        <div style={{
          display: 'flex',
          gap: '1rem',
          marginTop: '1rem'
        }}>
          <motion.button
            {...buttonAnimations.default}
            onClick={handleSave}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: theme.colors.primary,
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Save size={16} />
            Save (Cmd+S)
          </motion.button>

          <motion.button
            {...buttonAnimations.default}
            onClick={toggleTheme}
            style={{
              backgroundColor: theme.colors.backgroundSecondary,
              color: theme.colors.text,
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: `1px solid ${theme.colors.border}`,
              cursor: 'pointer',
            }}
          >
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default CompleteExample;
```

---

## Best Practices

### 1. Always Use Theme Colors

❌ **Don't:**
```jsx
<div style={{ backgroundColor: '#3b82f6' }}>
```

✅ **Do:**
```jsx
const { theme } = useTheme();
<div style={{ backgroundColor: theme.colors.primary }}>
```

### 2. Use Design Tokens for Consistency

❌ **Don't:**
```jsx
<div style={{ padding: '12px', borderRadius: '8px' }}>
```

✅ **Do:**
```jsx
import { spacing, borderRadius } from '@/styles/designTokens';
<div style={{ padding: spacing[3], borderRadius: borderRadius.lg }}>
```

### 3. Leverage Animation Presets

❌ **Don't:**
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
>
```

✅ **Do:**
```jsx
import { slideUpVariants } from '@/lib/animations';
<motion.div variants={slideUpVariants} initial="initial" animate="animate">
```

### 4. Use Toast for User Feedback

✅ **Always provide feedback:**
```jsx
const { success, error } = useToast();

try {
  await saveData();
  success('Data saved successfully!');
} catch (err) {
  error('Failed to save', { description: err.message });
}
```

### 5. Register Shortcuts for Common Actions

✅ **Make your app keyboard-friendly:**
```jsx
useKeyboardShortcutsMap({
  save: handleSave,
  search: handleSearch,
  undo: handleUndo,
});
```

---

## TypeScript Support

If you're using TypeScript, create type definitions:

```typescript
// src/types/theme.d.ts
export interface Theme {
  name: string;
  colors: {
    primary: string;
    background: string;
    text: string;
    // ... add all color properties
  };
  shadows: {
    // ... shadow properties
  };
}

export type ThemeMode = 'light' | 'dark' | 'system';
```

---

## Testing

### Testing Components with Theme

```jsx
import { render } from '@testing-library/react';
import { ThemeProvider } from '@/lib/theme';

function renderWithTheme(component) {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
}

test('renders with theme', () => {
  const { getByText } = renderWithTheme(<MyComponent />);
  expect(getByText('Hello')).toBeInTheDocument();
});
```

---

## Performance Tips

1. **Use CSS Custom Properties** - The theme system automatically applies CSS variables for better performance
2. **Memoize Animated Components** - Use React.memo for components with animations
3. **Debounce Theme Switches** - If allowing rapid theme changes, debounce the toggle function
4. **Limit Toast Count** - Set a reasonable `max` value in ToastProvider (3-5)
5. **Use CSS Animations** - For simple animations, use CSS instead of JavaScript

---

## Browser Support

- **Theme System**: All modern browsers + IE11 (with polyfills)
- **Animations**: Requires Framer Motion or modern browser for CSS animations
- **Toast**: All modern browsers
- **Keyboard Shortcuts**: All modern browsers

---

## Troubleshooting

### Theme not applying?
- Ensure ThemeProvider wraps your entire app
- Check that you're using the useTheme hook correctly
- Verify CSS custom properties are being set

### Animations not working?
- Install framer-motion: `npm install framer-motion`
- Check that variants are passed correctly
- Ensure initial/animate props are set

### Keyboard shortcuts not firing?
- Verify KeyboardShortcutsProvider wraps your app
- Check that shortcut IDs match registered shortcuts
- Test in non-input fields first

### Toasts not showing?
- Ensure ToastProvider is in your component tree
- Check z-index values don't conflict
- Verify portal is rendering to document.body

---

## Support & Resources

- **Design Tokens**: `/src/styles/designTokens.js`
- **Theme Hook**: `import { useTheme } from '@/lib/theme'`
- **Animations**: `import animations from '@/lib/animations'`
- **Toast**: `import { useToast } from '@/components/ui/Toast'`
- **Shortcuts**: `import { useKeyboardShortcuts } from '@/lib/keyboardShortcuts'`

For issues or questions, refer to the inline documentation in each module.
