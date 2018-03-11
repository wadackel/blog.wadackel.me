const path = require('path');
const webpack = require('webpack');
const WorkboxBuildWebpackPlugin = require('workbox-webpack-plugin');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const DIST_DIR = path.resolve(__dirname, 'static');

module.exports = {
  mode: IS_PRODUCTION ? 'production' : 'development',

  entry: './src/js/app.js',

  output: {
    filename: 'app.bundle.js',
    path: path.resolve(DIST_DIR, 'js'),
  },

  devtool: IS_PRODUCTION ? false : 'inline-source-map',

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          'babel-loader',
        ],
      },
    ],
  },

  plugins: [
    ...(IS_PRODUCTION ? [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
    ] : []),
    new WorkboxBuildWebpackPlugin({
      globDirectory: DIST_DIR,
      globPatterns: ['**/*.{html,js,css}'],
      swDest: path.join(DIST_DIR, 'sw.js'),
      runtimeCaching: [
        {
          urlPattern: new RegExp('^https://fonts.(?:googleapis|gstatic).com/(.*)'),
          handler: 'cacheFirst',
          options: {
            cacheName: 'googleapis',
            cacheExpiration: {
              maxEntries: 30,
              maxAgeSeconds: 60 * 60 * 24 * 30,
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: /.*(?:googleapis|gstatic)\.com.*$/,
          handler: 'staleWhileRevalidate',
        },
      ],
      clientsClaim: true,
      skipWaiting: true,
    }),
  ],

  optimization: {
    namedModules: true,
    noEmitOnErrors: true,
    minimize: IS_PRODUCTION,
  },
};
