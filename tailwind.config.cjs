/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    fontFamily: {
      sans: ['system-ui', 'sans-serif'],
      mono: [
        'ui-monospace',
        'SFMono-Regular',
        'SF Mono',
        'Menlo',
        'Consolas',
        'Liberation Mono',
        'monospace',
      ],
      accent: ['Caveat', 'serif'],
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        md: '2rem',
      },
    },
    extend: {
      spacing: {
        footer: '500px',
      },
      colors: {
        white: '#fff',
        primary: {
          50: '#bffff1',
          100: '#78f3d0',
          200: '#38e6be',
          300: '#11deaa',
          400: '#05d6a1',
          500: '#00c795',
          600: '#00a97f',
          700: '#008967',
          800: '#006a53',
          900: '#004a3e',
        },
        secondary: {
          50: '#bdccd8',
          100: '#87a1b8',
          200: '#668098',
          300: '#496178',
          400: '#304457',
          500: '#1b2937',
          600: '#172330',
          700: '#141d28',
          800: '#101821',
          900: '#0d121a',
        },
      },
      transitionTimingFunction: {
        'in-quint': 'cubic-bezier(0.755, 0.05, 0.855, 0.06)',
        'out-quint': 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
    },
  },
  plugins: [
    ({ addBase, theme }) => {
      addBase({
        html: {
          minHeight: '100vh',
          fontWeight: theme('fontWeight.medium'),
          color: theme('colors.secondary.500'),
          letterSpacing: '0.05em',
        },
        body: {
          minHeight: '100vh',
        },
        ':focus-visible': {
          outlineStyle: 'solid',
          outlineWidth: '3px',
          outlineColor: 'rgba(141,202,253,0.5)',
          outlineOffset: '1px',
        },
        a: {
          color: theme('colors.primary.700'),
          textDecoration: 'underline',
          transitionProperty: 'color',
          transitionDuration: '250ms',
          transitionTimingFunction: theme('transitionTimingFunction.out-quint'),
          '&:hover': {
            textDecoration: 'none',
            color: theme('colors.primary.500'),
          },
        },
      });
    },
    ({ addComponents }) => {
      addComponents({
        '.container': {
          maxWidth: '100%',
          '@screen sm': {
            maxWidth: '608px',
          },
          '@screen md': {
            maxWidth: '720px',
          },
          '@screen lg': {
            maxWidth: '882px',
          },
          '@screen xl': {
            maxWidth: '882px',
          },
          '@screen 2xl': {
            maxWidth: '882px',
          },
        },
      });
    },
  ],
};
