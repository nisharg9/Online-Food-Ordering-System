/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // BlushBites Pink & Cream theme
        blush: {
          50:  '#FFF5F7',  // Page background
          100: '#FFE8EE',
          200: '#FFC1CC',  // Hover/accent
          300: '#FF9AB3',
          400: '#FF7499',
          500: '#FF6B9D',  // Primary
          600: '#E5578A',
          700: '#CC4477',
          800: '#B23163',
          900: '#991F50',
        },
        cream: {
          50:  '#FFFAF7',
          100: '#FFF5EE',
          200: '#FFE8D5',
        },
        success: '#A8D5BA',
        error:   '#FF6B6B',
      },
      fontFamily: {
        sans: ['Poppins', 'Nunito', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        'pink':  '0 4px 20px rgba(255, 107, 157, 0.15)',
        'pink-lg': '0 8px 40px rgba(255, 107, 157, 0.25)',
        'card':  '0 2px 16px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.12)',
      },
      animation: {
        'toast-in': 'toastIn 0.3s ease-out',
        'fade-in':  'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'bounce-soft': 'bounceSoft 0.6s ease-out',
        'spin-slow': 'spin 1.5s linear infinite',
        'pulse-pink': 'pulsePink 2s ease-in-out infinite',
      },
      keyframes: {
        toastIn: {
          '0%':   { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':      { transform: 'scale(1.05)' },
        },
        pulsePink: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255,107,157,0.4)' },
          '50%':      { boxShadow: '0 0 0 8px rgba(255,107,157,0)' },
        },
      },
    },
  },
  plugins: [],
}
