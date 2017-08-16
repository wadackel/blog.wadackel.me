module.exports = {
  plugins: {
    'postcss-easy-import': {},
    'postcss-cssnext': {
      features: {
        applyRule: false,
        rem: false,
      },
    },
    cssnano: {
      autoprefixer: false,
    },
  },
};
