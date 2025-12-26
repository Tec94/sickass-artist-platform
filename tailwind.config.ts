import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          cyan: '#00D9FF',
          pink: '#FF006E',
        },
        secondary: {
          purple: '#8B0FFF',
          green: '#39FF14',
        },
        background: {
          dark: '#0A0E27',
          charcoal: '#1C1F2E',
        },
        accent: {
          gold: '#FFD700',
          silver: '#C0C0C0',
        },
        'neon-green': '#39FF14',
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'gear-spin': 'gear-spin 10s linear infinite',
        'slide-in': 'slide-in 0.5s ease-out',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0, 217, 255, 0.5)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 217, 255, 1)' },
        },
        'gear-spin': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'slide-in': {
          from: { transform: 'translateX(-100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
      },
      screens: {
        'mobile': '320px',
        'tablet': '768px',
        'desktop': '1024px',
      },
    },
  },
  plugins: [],
}

export default config
