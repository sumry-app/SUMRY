/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      // Every token below is driven by a CSS custom property defined in
      // src/index.css. Previously `colors` was empty, which meant classes like
      // `bg-primary` and `text-muted-foreground` generated no CSS at all and
      // the entire UI kit rendered unstyled.
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          soft: "hsl(var(--primary-soft))",
          strong: "hsl(var(--primary-strong))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          soft: "hsl(var(--accent-soft))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
          soft: "hsl(var(--destructive-soft))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
          soft: "hsl(var(--success-soft))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
          soft: "hsl(var(--warning-soft))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
          soft: "hsl(var(--info-soft))",
        },
      },

      fontFamily: {
        // Fraunces carries the personality; Jakarta does the reading work.
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },

      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.06em' }],
      },

      borderRadius: {
        '4xl': '2rem',
        '3xl': '1.5rem',
        '2xl': '1.125rem',
        xl: 'calc(var(--radius) - 0.25rem)',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 0.375rem)',
        sm: 'calc(var(--radius) - 0.5rem)',
      },

      // Warm-tinted shadows. Neutral-gray shadows are what make an interface
      // read as clinical; tinting them toward the background keeps depth
      // without coldness.
      boxShadow: {
        soft: '0 1px 2px -1px hsl(var(--shadow-color) / 0.10), 0 2px 6px -2px hsl(var(--shadow-color) / 0.08)',
        card: '0 1px 3px -1px hsl(var(--shadow-color) / 0.09), 0 6px 16px -6px hsl(var(--shadow-color) / 0.10)',
        lifted: '0 2px 4px -2px hsl(var(--shadow-color) / 0.10), 0 12px 28px -8px hsl(var(--shadow-color) / 0.16)',
        float: '0 8px 20px -6px hsl(var(--shadow-color) / 0.16), 0 24px 48px -16px hsl(var(--shadow-color) / 0.22)',
        glow: '0 8px 24px -6px hsl(var(--primary) / 0.42)',
        'glow-accent': '0 8px 24px -6px hsl(var(--accent) / 0.40)',
        inset: 'inset 0 1px 0 0 hsl(0 0% 100% / 0.65)',
      },

      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'bar-grow': {
          from: { transform: 'scaleX(0)' },
          to: { transform: 'scaleX(1)' },
        },
      },

      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.4s ease-out both',
        'scale-in': 'scale-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
        shimmer: 'shimmer 1.8s infinite',
        'bar-grow': 'bar-grow 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
      },

      transitionTimingFunction: {
        spring: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
