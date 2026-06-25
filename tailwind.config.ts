import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:           'var(--bg)',
        surface:      'var(--surface)',
        accent:       'var(--accent-color)',
        success:      'var(--success)',
        danger:       'var(--danger)',
        warning:      'var(--warning)',
        'text-primary': 'var(--text-primary)',
        'text-muted': 'var(--text-muted)',
        border:       'var(--border-color)',
      },
      borderColor: { DEFAULT: 'var(--border-color)' },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
