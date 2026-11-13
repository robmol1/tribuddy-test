// Kleuren, afronding en lettertype komen uit src/styles/tokens.css
const token = (name) => `rgb(var(--color-${name}) / <alpha-value>)`

module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        page: token('page'),
        surface: token('surface'),
        ink: token('ink'),
        muted: token('muted'),
        link: { DEFAULT: token('link'), soft: token('link-soft') },
        action: { DEFAULT: token('action'), hover: token('action-hover') },
        success: token('success'),
        danger: token('danger'),
        navy: token('navy'),
        line: token('line'),
        'on-dark': {
          DEFAULT: token('on-dark'),
          muted: token('on-dark-muted'),
          accent: token('on-dark-accent'),
          link: token('on-dark-link'),
        },
      },
      borderRadius: {
        control: 'var(--radius-control)',
        button: 'var(--radius-button)',
        card: 'var(--radius-card)',
      },
      fontFamily: {
        sans: 'var(--font-sans)',
      },
      maxWidth: {
        shell: 'var(--width-shell)',
      },
      backgroundImage: {
        'hero-overlay': 'var(--overlay-hero)',
        feature: 'var(--gradient-feature)',
        finish: 'var(--gradient-finish)',
      },
      boxShadow: {
        cta: '0 8px 22px rgb(var(--color-action) / 0.19)',
      },
    },
  },
  plugins: [],
}
