/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#050b14',
          surface: '#0a1220',
          card: '#0f1b2f',
          border: '#1e293b',
          cyan: '#06b6d4',
          cyanGlow: '#22d3ee',
          violet: '#8b5cf6',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
          textMuted: '#94a3b8',
        }
      }
    },
  },
  plugins: [],
}
