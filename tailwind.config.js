/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'micelio': {
          50: '#fdfbf7',
          100: '#f5efe1',
          200: '#e8dcc0',
          300: '#d6c194',
          400: '#c0a168',
          500: '#a88748',
          600: '#8b6d38',
          700: '#6e5530',
          800: '#52402a',
          900: '#3a2e22',
        },
        'tierra': {
          50: '#faf8f5',
          100: '#f0ebe2',
          200: '#dfd5c1',
          300: '#c5b395',
          400: '#a8916b',
          500: '#8e7752',
          600: '#735e42',
          700: '#5a4836',
          800: '#42362a',
          900: '#2d251f',
        },
        'hongo': {
          50: '#f8f7f4',
          100: '#ede9df',
          200: '#dad1bd',
          300: '#c2b394',
          400: '#a8966f',
          500: '#937f57',
          600: '#796948',
          700: '#5e533c',
          800: '#3f3829',
          900: '#26221a',
        },
      },
      fontFamily: {
        'sans': ['system-ui', '-apple-system', 'sans-serif'],
        'serif': ['Georgia', 'serif'],
        'display': ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
