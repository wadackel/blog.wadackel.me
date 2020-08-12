module.exports = {
  plugins: [
    require('postcss-custom-media'),
    require('postcss-nesting'),
    require('css-mqpacker')({
      sort: true,
    }),
    require('cssnano')({
      preset: [
        'default',
        {
          normalizeUrl: false,
        },
      ],
    }),
  ],
};
