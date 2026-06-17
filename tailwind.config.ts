import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#D4A017',
          light: '#E8B94F',
          muted: '#8A6810',
        },
        cobalt: {
          DEFAULT: '#4B3DE8',
          light: '#7B6FF0',
          dark: '#2E23B0',
        },
        surface: {
          DEFAULT: '#111111',
          raised: '#1A1A1A',
        },
        border: {
          DEFAULT: '#2A2A2A',
        },
        'text-primary': '#F5F0E8',
        'text-secondary': '#A09070',
        'text-muted': '#5A5040',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4A017 0%, #E8B94F 100%)',
        'cobalt-gradient': 'linear-gradient(135deg, #4B3DE8 0%, #7B6FF0 100%)',
        'dual-gradient': 'linear-gradient(135deg, #4B3DE8 0%, #D4A017 100%)',
      },
    },
  },
  plugins: [],
}

export default config
