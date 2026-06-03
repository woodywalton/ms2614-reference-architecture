/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#0D1117',
          800: '#161B22',
          700: '#1C2333',
          600: '#22293A',
        },
        line: '#2A3344',
        text: {
          primary: '#E6EDF3',
          muted: '#8B949E',
        },
        accent: {
          teal: '#00BFB3',
          blue: '#0077CC',
          gray: '#6E7681',
          purple: '#7B5EA7',
          green: '#2EA043',
          coral: '#CF4F27',
          yellow: '#D29922',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
