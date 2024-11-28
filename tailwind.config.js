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
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        light: {
          primary: '#FF6B6B',
          secondary: '#4ECDC4',
          accent: '#FFE66D',
          background: '#ffffff',
          text: '#2C3E50',
        },
        dark: {
          primary: '#2C3E50',
          secondary: '#34495E',
          accent: '#3498DB',
          background: '#1a1a1a',
          text: '#ECF0F1',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 