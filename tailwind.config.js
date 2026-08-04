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
        'admin-base': 'var(--admin-base)',
        'admin-card': 'var(--admin-card)',
        'admin-border': 'var(--admin-border)',
        'admin-text': 'var(--admin-text)',
        'admin-muted': 'var(--admin-muted)',
        'admin-accent': 'var(--admin-accent)',
        'admin-success': 'var(--admin-success)',
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
