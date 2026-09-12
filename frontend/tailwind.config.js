/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:               '#0A0E1A',
        surface:          '#111827',
        'surface-raised': '#1A2235',
        border:           '#1E2D45',
        primary:          '#E2E8F0',
        secondary:        '#7B90B2',
        muted:            '#3D5070',
        accent:           '#3B82F6',
        'accent-dim':     '#0F2044',
        positive:         '#10B981',
        'positive-dim':   '#052E1C',
        negative:         '#EF4444',
        'negative-dim':   '#2C0A0A',
        warning:          '#F59E0B',
        frontier:         '#6366F1',
        'portfolio-ml':   '#8B5CF6',
        'portfolio-trad': '#3B82F6',
        'portfolio-bl':   '#06B6D4',
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      fontSize: {
        'heading': ['1.125rem', { lineHeight: '1.5rem', fontWeight: '600' }],
        'body':    ['0.875rem', { lineHeight: '1.25rem' }],
        'small':   ['0.75rem',  { lineHeight: '1rem' }],
        'value':   ['1.25rem',  { lineHeight: '1.75rem' }],
      },
    },
  },
  plugins: [],
}
