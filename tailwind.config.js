/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'admin-base': '#09090b',
        'admin-card': '#18181b',
        'admin-border': '#27272a',
        'admin-accent': '#0ea5e9',
        'admin-success': '#10b981',
        'nd-blue': '#0084ff',
        'nd-purple': '#9333ea',
        'nd-green': '#10b981',
        'nd-dark': '#0f172a',
      },
      borderRadius: {
        '3xl': '30px',
      },
      boxShadow: {
        'nd-premium': '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
        'nd-hover': '0 30px 40px -10px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
