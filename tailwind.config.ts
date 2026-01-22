import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./roa-wolves/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#DC2626', // Red-600 (Scarlet/Fire)
          hover: '#B91C1C', // Red-700
          light: '#EF4444', // Red-500
        },
        secondary: {
          DEFAULT: '#F97316', // Orange-500 (Sunset/Fire)
          hover: '#EA580C', // Orange-600
        },
        background: {
          dark: '#000000', // Deep Black
          charcoal: '#121212', // Slightly lighter black for cards
          paper: '#1A1A1A', // Even lighter for elevated surfaces
        },
        accent: {
          gold: '#FFD700',
          silver: '#E5E7EB', // Cool gray/silver
          red: '#EF4444',
        },
        // Legacy support mapping (to prevent immediate breaks, but mapped to new scheme)
        'neon-green': '#DC2626',
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'], // Added for headings
      },
      animation: {
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'gear-spin': 'gear-spin 10s linear infinite',
        'slide-in': 'slide-in 0.5s ease-out',
        'fade-in': 'fade-in 0.8s ease-out',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(220, 38, 38, 0.3)' }, // Red glow
          '50%': { boxShadow: '0 0 25px rgba(249, 115, 22, 0.6)' }, // Orange glow
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
        'mobile': '320px',
        'tablet': '768px',
        'desktop': '1024px',
      },
      zIndex: {
        '90': '90',
        '95': '95',
        '100': '100',
      }
    },
  },
  plugins: [],
}

export default config
