/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Noto Sans Devanagari', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#070A18',
          900: '#0B1024',
          850: '#101633',
          800: '#151C40',
          700: '#202A55',
        },
        violet: {
          450: '#9467F5',
        },
        aqua: {
          400: '#35D6DA',
        },
      },
      boxShadow: {
        panel: '0 10px 40px -18px rgba(5, 8, 25, 0.65)',
        glow: '0 0 0 1px rgba(148, 103, 245, 0.25), 0 12px 36px -20px rgba(148, 103, 245, 0.8)',
      },
      keyframes: {
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: { 'fade-up': 'fade-up 260ms ease-out both' },
    },
  },
  plugins: [],
};
