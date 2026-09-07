/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FDF8F3',
          100: '#FBF0E4',
          200: '#F6DEC6',
          300: '#EFC49F',
          400: '#E5A471',
          500: '#D97706', // Primary Saffron/Amber
          600: '#C85A17', // Deep Terracotta
          700: '#A04000',
          800: '#7E3000',
          900: '#5F2400',
        },
        warmbg: {
          DEFAULT: '#FFFDF9',
          card: '#FBF8F3',
          soft: '#F4EFE6',
          accent: '#EDE5D8',
        },
        emeraldAcc: {
          DEFAULT: '#2A9D8F',
          dark: '#1F7A6F',
          light: '#E6F5F3',
        },
        charcoal: {
          DEFAULT: '#2D3142',
          muted: '#5C6378',
          light: '#8D96A8',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        display: ['"Outfit"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'warm': '0 4px 20px -2px rgba(200, 90, 23, 0.08)',
        'warm-hover': '0 10px 25px -3px rgba(200, 90, 23, 0.15)',
      }
    },
  },
  plugins: [],
}
