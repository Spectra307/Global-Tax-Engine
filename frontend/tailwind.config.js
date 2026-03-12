/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#6C63FF',
        'primary-dark': '#5a52e0',
        secondary: '#00D9A5',
        accent: '#FF7A18',
        bg: '#F7F8FC'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 4px 24px rgba(108, 99, 255, 0.08)',
        'card-hover': '0 8px 40px rgba(108, 99, 255, 0.16)'
      }
    }
  },
  plugins: []
};
