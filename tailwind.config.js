/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        plum: {
          950: '#140c1d',
          900: '#21152F', // Deep midnight plum
          800: '#342344', // Dark aubergine
          700: '#4a3461',
          600: '#644882',
        },
        lime: {
          DEFAULT: '#C8F169', // Electric lime
          dark: '#a8d540',
          hover: '#b5e354',
          light: '#e5fab2',
        },
        lavender: {
          DEFAULT: '#E8DFF4', // Soft lavender
          muted: '#ded2ee',
          light: '#f5f0fb',
        },
        ivory: {
          DEFAULT: '#F8F6F0', // Warm ivory
          50: '#FDFBF7',
          100: '#F8F6F0',
          200: '#EDE9DE',
          300: '#E0DACB',
        },
        mutedgray: '#8B8792',
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(33, 21, 47, 0.05), 0 10px 25px -5px rgba(33, 21, 47, 0.04)',
        'elevated': '0 10px 30px -10px rgba(33, 21, 47, 0.08), 0 4px 6px -2px rgba(33, 21, 47, 0.03)',
        'premium': '0 20px 40px -15px rgba(33, 21, 47, 0.12)',
        'glow-lime': '0 0 20px rgba(200, 241, 105, 0.35)',
      }
    },
  },
  plugins: [],
}
