/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      colors: {
        'sidebar-dark': '#1a2234',
        'card-orange': '#ff6b35',
        'card-blue': '#3498db',
        'card-purple': '#9b59b6',
      }
    },
  },
  plugins: [],
};
