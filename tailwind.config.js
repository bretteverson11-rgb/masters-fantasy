/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        masters: {
          green: '#1a5c38',
          gold: '#c9a84c',
          yellow: '#ffe066',
        }
      }
    },
  },
  plugins: [],
}
