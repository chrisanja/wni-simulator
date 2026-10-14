/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        game: {
          dark: '#0f172a',
          board: '#1e293b',
          tile: '#334155',
          accent: '#eab308',
          start: '#22c55e',
          jail: '#ef4444',
          takdir: '#3b82f6',
          musibah: '#f97316',
          tax: '#a855f7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
