/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,css,less}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        text: 'var(--color-text)',
        muted: 'var(--color-text-muted)',
        bg: 'var(--color-bg)',
      },
      borderRadius: {
        card: '12px',
      },
    },
  },
  plugins: [],
};
