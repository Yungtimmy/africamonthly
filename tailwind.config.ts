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
        // Injective / cosmic blue palette
        inj: {
          DEFAULT: '#00D4FF',
          dark: '#0099CC',
          deep: '#0057A8',
          glow: '#00D4FF',
        },
        // Gold accent (African identity)
        gold: {
          DEFAULT: '#D4A017',
          light: '#E8B94F',
          muted: '#8A6810',
        },
        // Base surfaces
        surface: {
          DEFAULT: '#0D1117',
          raised: '#111827',
          glass: 'rgba(255,255,255,0.04)',
        },
        navy: {
          DEFAULT: '#0A0F1E',
          mid: '#0D1525',
          light: '#111E35',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'cosmic': 'radial-gradient(ellipse at 20% 50%, rgba(0,212,255,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(212,160,23,0.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 100%, rgba(0,87,168,0.1) 0%, transparent 60%)',
        'inj-gradient': 'linear-gradient(135deg, #00D4FF 0%, #0057A8 100%)',
        'gold-gradient': 'linear-gradient(135deg, #D4A017 0%, #E8B94F 100%)',
        'dual-gradient': 'linear-gradient(135deg, #00D4FF 0%, #D4A017 100%)',
        'glass-border': 'linear-gradient(135deg, rgba(0,212,255,0.3), rgba(255,255,255,0.05), rgba(212,160,23,0.2))',
      },
      boxShadow: {
        'inj': '0 0 20px rgba(0,212,255,0.25), 0 0 60px rgba(0,212,255,0.08)',
        'inj-sm': '0 0 10px rgba(0,212,255,0.2)',
        'gold': '0 0 20px rgba(212,160,23,0.3)',
        'glass': '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
        'card': '0 4px 24px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.04)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'aurora': 'aurora 8s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        aurora: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
}

export default config
