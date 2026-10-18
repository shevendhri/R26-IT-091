/** @type {import('tailwindcss').Config} */
export default {
  // Scoped to the Plan Analyzer feature only — do not widen this to scan the
  // rest of src/app or src/components, since other members' pages use plain
  // inline styles and don't expect Tailwind's utility classes to exist.
  content: [
    './src/app/plan-analyzer/**/*.{js,jsx}',
    './src/components/PlanAnalyzer/**/*.{js,jsx}',
  ],
  // Preflight (Tailwind's global CSS reset) is never imported anywhere in
  // this project — the shared src/app/globals.css already has its own reset
  // that every page relies on. Keeping this off is a safety net in case that
  // ever changes.
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      fontFamily: {
        // The shared design system uses these literal font stacks (see
        // src/app/globals.css) rather than --font-heading/--font-sans vars.
        heading: ['Space Grotesk', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        eco: {
          black: 'var(--eco-black)',
          deep: 'var(--eco-deep)',
          card: 'var(--eco-card)',
          'card-raised': 'var(--eco-card-raised)',
          mid: 'var(--eco-mid)',
          slate: 'var(--eco-slate)',
          border: 'var(--eco-border)',
          'border-subtle': 'var(--eco-border-subtle)',
          'border-strong': 'var(--eco-border-strong)',
        },
        ink: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          accent: 'var(--text-accent)',
        },
        'brand-green': { DEFAULT: 'var(--green)', dim: 'var(--green-dim)', border: 'var(--green-border)' },
        'brand-blue': { DEFAULT: 'var(--blue)', dim: 'var(--blue-dim)', border: 'var(--blue-border)' },
        'brand-amber': { DEFAULT: 'var(--amber)', dim: 'var(--amber-dim)', border: 'var(--amber-border)' },
        'brand-red': { DEFAULT: 'var(--red)', dim: 'var(--red-dim)', border: 'var(--red-border)' },
      },
      borderRadius: {
        card: 'var(--radius-card)',
        inner: 'var(--radius-inner)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'card-hover': '0 2px 8px rgba(20,34,27,0.08), 0 10px 28px rgba(20,34,27,0.10)',
        glow: '0 0 20px rgba(30, 84, 56, 0.30)',
      },
    },
  },
  plugins: [],
}
