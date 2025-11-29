import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ChainReach Brand Colors
        'navy-primary': '#1a2332',
        'navy-secondary': '#2d3e50',
        'navy-light': '#3d4f6a',
        'cyan-primary': '#00d4ff',
        'cyan-secondary': '#00b8d9',
        'cyan-light': '#33ddff',
        
        // Agent Colors (4-Agent System)
        'agent-1-blue': '#3b82f6',
        'agent-1-blue-light': '#60a5fa',
        'agent-1-blue-dark': '#2563eb',
        'agent-2-green': '#10b981',
        'agent-2-green-light': '#34d399',
        'agent-2-green-dark': '#059669',
        'agent-3-orange': '#f59e0b',
        'agent-3-orange-light': '#fbbf24',
        'agent-3-orange-dark': '#d97706',
        'agent-4-purple': '#8b5cf6',
        'agent-4-purple-light': '#a78bfa',
        'agent-4-purple-dark': '#7c3aed',
        
        // Status Colors
        'success': '#10b981',
        'success-light': '#d1fae5',
        'success-dark': '#065f46',
        'error': '#ef4444',
        'error-light': '#fee2e2',
        'error-dark': '#991b1b',
        'warning': '#f59e0b',
        'warning-light': '#fef3c7',
        'warning-dark': '#92400e',
        'info': '#3b82f6',
        'info-light': '#dbeafe',
        'info-dark': '#1e40af',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      animation: {
        'border-pulse': 'border-pulse 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        'border-pulse': {
          '0%, 100%': {
            borderColor: '#3b82f6',
            boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.4)',
          },
          '50%': {
            borderColor: '#60a5fa',
            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0)',
          },
        },
        fadeIn: {
          from: {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
}
export default config