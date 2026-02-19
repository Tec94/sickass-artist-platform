import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './roa-wolves/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          500: '#A62B3A',
          600: '#7F1F2C',
          700: '#5F1621',
          light: '#C97A87',
        },
        primary: {
          DEFAULT: '#A62B3A',
          hover: '#7F1F2C',
        },
        night: {
          950: '#04070B',
          900: '#0A1118',
          800: '#111A24',
          700: '#1A2531',
        },
        steel: {
          300: '#C5D0DA',
          400: '#9AA7B5',
          500: '#7B8999',
          600: '#5A697A',
        },
        crimson: {
          400: '#C97A87',
          500: '#A62B3A',
          600: '#7F1F2C',
        },
        bg: {
          app: '#04070B',
          base: '#0A1118',
          surface: '#111A24',
          elevated: '#1A2531',
        },
        border: {
          subtle: 'rgba(154, 167, 181, 0.25)',
          DEFAULT: '#2A3541',
        },
        text: {
          primary: '#E8E1D5',
          secondary: '#9AA7B5',
          tertiary: '#667789',
        },
        success: {
          DEFAULT: '#5CA38C',
          dim: 'rgba(92, 163, 140, 0.15)',
        },
        warning: {
          DEFAULT: '#C4A26F',
          dim: 'rgba(196, 162, 111, 0.14)',
        },
        danger: {
          DEFAULT: '#A95B69',
          dim: 'rgba(169, 91, 105, 0.14)',
        },
        info: {
          DEFAULT: '#8EA0B3',
          dim: 'rgba(142, 160, 179, 0.14)',
        },
        neutral: {
          functional: '#8b8b8b',
        },
        background: {
          dark: '#04070B',
          charcoal: '#0A1118',
          paper: '#111A24',
        },
        accent: {
          gold: '#C4A26F',
          silver: '#B9C4D0',
          red: '#A95B69',
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
