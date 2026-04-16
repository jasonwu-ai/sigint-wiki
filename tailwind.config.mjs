/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts}'],
  theme: {
    extend: {
      colors: {
        canvas:  '#08090a',
        panel:   '#0f1011',
        surface: '#191a1b',
        elevated:'#28282c',
        accent: {
          DEFAULT: '#14b8a6',
          hover:  '#2dd4bf',
          muted:  'rgba(20, 184, 166, 0.15)',
        },
        fresh:   '#10b981',
        recent:  '#f59e0b',
        stale:   '#62666d',
        type: {
          body:      '#d0d6e0',
          event:     '#f59e0b',
          entity:    '#3b82f6',
          market:    '#10b981',
          narrative: '#a855f7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderColor: {
        DEFAULT: 'rgba(255, 255, 255, 0.08)',
        subtle:  'rgba(255, 255, 255, 0.05)',
      },
      borderRadius: {
        card: '12px',
        btn:  '6px',
      },
    },
  },
  plugins: [],
};
