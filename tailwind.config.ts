import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        uno: {
          red: '#dc2626',
          yellow: '#eab308',
          green: '#16a34a',
          blue: '#2563eb',
          dark: '#0f172a',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
