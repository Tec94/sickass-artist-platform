import type { Config } from 'tailwindcss'

const cssVar = (name: string) => `var(${name})`

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './roa-wolves/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1C1B1A',
          soft: 'rgba(28, 27, 26, 0.15)',
        },
        parchment: {
          DEFAULT: '#F4EFE6',
        },
        vellum: {
          DEFAULT: '#FCFBF9',
        },
        muted: {
          DEFAULT: '#8E7D72',
        },
        brand: {
          500: cssVar('--color-accent-brand'),
          600: cssVar('--color-accent-brand-hover'),
          light: cssVar('--color-accent-brand-soft'),
        },
        primary: {
          DEFAULT: cssVar('--color-accent-brand'),
          hover: cssVar('--color-accent-brand-hover'),
        },
        night: {
          950: cssVar('--color-bg-app'),
          900: cssVar('--color-bg-base'),
          800: cssVar('--color-bg-surface'),
          700: cssVar('--color-bg-elevated'),
        },
        steel: {
          300: '#c5d0da',
          400: cssVar('--color-text-secondary'),
          500: cssVar('--color-text-tertiary'),
          600: '#6c8096',
        },
        crimson: {
          400: cssVar('--color-accent-brand-soft'),
          500: cssVar('--color-accent-brand'),
          600: cssVar('--color-accent-brand-hover'),
        },
        bg: {
          app: cssVar('--color-bg-app'),
          base: cssVar('--color-bg-base'),
          surface: cssVar('--color-bg-surface'),
          elevated: cssVar('--color-bg-elevated'),
        },
        border: {
          subtle: cssVar('--color-border-subtle'),
          strong: cssVar('--color-border-strong'),
          DEFAULT: cssVar('--color-border-subtle'),
        },
        text: {
          primary: cssVar('--color-text-primary'),
          secondary: cssVar('--color-text-secondary'),
          tertiary: cssVar('--color-text-tertiary'),
        },
        success: {
          DEFAULT: cssVar('--color-state-success'),
          dim: 'rgba(120, 191, 167, 0.16)',
        },
        warning: {
          DEFAULT: cssVar('--color-state-warning'),
          dim: 'rgba(212, 178, 127, 0.16)',
        },
        danger: {
          DEFAULT: cssVar('--color-state-danger'),
          dim: 'rgba(195, 125, 139, 0.16)',
        },
        info: {
          DEFAULT: cssVar('--color-state-info'),
          dim: 'rgba(155, 180, 204, 0.16)',
        },
        neutral: {
          functional: '#a0b0c2',
        },
        background: {
          dark: cssVar('--color-bg-app'),
          charcoal: cssVar('--color-bg-base'),
          paper: cssVar('--color-bg-surface'),
        },
        accent: {
          gold: cssVar('--color-state-warning'),
          silver: cssVar('--color-text-secondary'),
          red: cssVar('--color-state-danger'),
        },
        ui: {
          surface: cssVar('--color-bg-surface'),
          'text-primary': cssVar('--color-text-primary'),
          'text-secondary': cssVar('--color-text-secondary'),
          'text-muted': cssVar('--color-text-tertiary'),
          brand: cssVar('--color-accent-brand'),
          info: cssVar('--color-state-info'),
          success: cssVar('--color-state-success'),
          warning: cssVar('--color-state-warning'),
          danger: cssVar('--color-state-danger'),
          focus: cssVar('--color-focus-ring'),
        },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        display: ['Cinzel', 'serif'],
        gothic: ['Cinzel', 'Cormorant Garamond', 'serif'],
      },
      dropShadow: {
        scarlet: '0 0 10px rgba(166, 43, 58, 0.5)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'aura-glow': 'aura-glow 2s ease-in-out infinite',
        'gear-spin': 'gear-spin 10s linear infinite',
        'slide-in': 'slide-in 0.5s ease-out',
        'fade-in': 'fade-in 0.8s ease-out',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(166, 43, 58, 0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(166, 43, 58, 0.55)' },
        },
        'aura-glow': {
          '0%, 100%': { filter: 'drop-shadow(0 0 5px rgba(166, 43, 58, 0.45))' },
          '50%': { filter: 'drop-shadow(0 0 20px rgba(166, 43, 58, 0.75))' },
        },
        'gear-spin': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'slide-in': {
          from: { transform: 'translateX(-20px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      screens: {
        mobile: '320px',
        tablet: '768px',
        desktop: '1024px',
      },
      zIndex: {
        '90': '90',
        '95': '95',
        '100': '100',
      },
    },
  },
  plugins: [],
}

export default config
