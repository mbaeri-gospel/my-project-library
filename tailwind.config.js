/** @type {import('tailwindcss').Config} */
export default {
  // Enables toggling theme styling using explicit document element classes
  darkMode: 'class', 
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom color depths for long-session dashboard environments
        gray: {
          850: '#1f293d',
          950: '#0b0f19',
        }
      }
    },
  },
  plugins: [],
}
