/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          DEFAULT: '#0077cc',
        },
      },
      keyframes: {
        spring: {
          '0%': { transform: 'translateY(0) scale(1)' },
          '25%': { transform: 'translateY(-8px) scale(1.02)' },
          '55%': { transform: 'translateY(-3px) scale(1.01)' },
          '85%': { transform: 'translateY(-1px) scale(1.005)' },
          '100%': { transform: 'translateY(0) scale(1)' },
        },
        'spring-subtle': {
          '0%': { transform: 'translateY(0) scale(1)' },
          '40%': { transform: 'translateY(-4px) scale(1.01)' },
          '70%': { transform: 'translateY(-1px) scale(1.003)' },
          '100%': { transform: 'translateY(0) scale(1)' },
        },
        'spring-strong': {
          '0%': { transform: 'translateY(0) scale(1)' },
          '30%': { transform: 'translateY(-12px) scale(1.08)' },
          '60%': { transform: 'translateY(-4px) scale(1.03)' },
          '100%': { transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        spring: 'spring 1000ms cubic-bezier(.25,.9,.35,1) both',
        'spring-subtle': 'spring-subtle 900ms cubic-bezier(.25,.9,.35,1) both',
        'spring-strong': 'spring-strong 1100ms cubic-bezier(.25,.9,.35,1) both',
      },
    },
  },
  plugins: [],
}
