/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      sans: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
      heading: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
      mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
    },
    extend: {
      colors: {
        midnight: '#0b1221',
        horizon: '#13203b',
        sky: '#4bb3fd',
        amber: '#f7b733',
        slate: '#c8d2e0',
      },
      screens: {
        xs: '420px',
      },
      boxShadow: {
        card: '0 20px 45px rgba(8, 15, 35, 0.18)',
      },
    },
  },
  plugins: [],
}

