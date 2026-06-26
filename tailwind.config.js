/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'admin-base': '#f8fafc', // slate-50
        'admin-card': '#ffffff', // white
        'admin-border': '#e2e8f0', // slate-200
        'admin-text': '#0f172a', // slate-900
        'admin-muted': '#64748b', // slate-500
        'admin-accent': '#2563eb', // blue-600
        'admin-success': '#059669', // emerald-600
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
