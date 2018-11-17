/* eslint-disable global-require, import/no-extraneous-dependencies */
module.exports = {
  plugins: [
    require('postcss-easy-import'),
    require('postcss-custom-media'),
    require('postcss-nesting'),
    require('autoprefixer')({
      remove: false,
      browsers: ['last 2 Chrome versions', 'last 2 Android versions', 'last 2 iOS versions'],
    }),
    require('css-mqpacker')({
      sort: true,
    }),
    require('cssnano')({
      autoprefixer: false,
    }),
    require('postcss-hash')({
      manifest: 'data/manifest.json',
    }),
  ],
};
