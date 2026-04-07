/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          green: '#2E7D32',
          lightGreen: '#E8F5E9',
          yellow: '#FBC02D',
          orange: '#E65100',
          cream: '#FFF8E1',
          creamDark: '#FFECB3',
          dark: '#3E2723'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
