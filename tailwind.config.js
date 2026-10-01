/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        roble: {
          50: '#f6f7f6',
          100: '#e3e6e3',
          200: '#c5ccc5',
          300: '#9faaa0',
          400: '#758577',
          500: '#58695a',
          600: '#435345',
          700: '#364338',
          800: '#2c362d',
          900: '#252d26',
          950: '#131814',
        },
      },
    },
  },
  plugins: [],
}
