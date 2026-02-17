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
          DEFAULT: '#e02d75', // ROA Scarlet Red
          hover: '#c02663', // Darker shade
          light: '#f180a0', // Primary Accent
        },
        surface: {
          dark: '#121212', // ROA Surface Dark
          tonal: '#25181b', // ROA Tonal Overlay
        },
        neutral: {
          functional: '#8b8b8b', // ROA Functional Neutral
        },
        background: {
          dark: '#000000', // Deep Black
          charcoal: '#121212', // Surface Dark
          paper: '#1A1A1A', // Slightly lighter
        },
        accent: {
          gold: '#FFD700',
          silver: '#E5E7EB',
          red: '#EF4444',
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        gothic: ['Morgh Gothic', 'UnifrakturMaguntia', 'MedievalSharp', 'serif'],
      },
      dropShadow: {
        'scarlet': '0 0 10px rgba(224, 45, 117, 0.5)',
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
          '0%, 100%': { boxShadow: '0 0 10px rgba(224, 45, 117, 0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(224, 45, 117, 0.6)' },
        },
        'aura-glow': {
          '0%, 100%': { filter: 'drop-shadow(0 0 5px rgba(224, 45, 117, 0.5))' },
          '50%': { filter: 'drop-shadow(0 0 20px rgba(224, 45, 117, 0.8))' },
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
