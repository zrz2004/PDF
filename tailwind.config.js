/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Microsoft YaHei UI"', '"Segoe UI"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Cascadia Code"', 'Consolas', 'monospace'],
      },
      colors: {
        studio: {
          bg: '#101010',
          panel: '#171717',
          raised: '#1f1f1f',
          line: 'rgba(255,255,255,0.08)',
          text: '#F4F1EA',
          muted: '#B8B1A7',
          faint: '#7D766D',
          accent: '#D97757',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(217,119,87,0.18), 0 24px 80px rgba(0,0,0,0.38)',
      },
    },
  },
  plugins: [],
}
