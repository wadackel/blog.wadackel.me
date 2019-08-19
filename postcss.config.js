/* eslint-disable global-require, import/no-extraneous-dependencies */
module.exports = {
  plugins: [
    require('postcss-easy-import'),
    require('postcss-custom-media'),
    require('postcss-nesting'),
    require('autoprefixer')({
      remove: false,
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
