const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const { GenerateSW } = require('workbox-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const DIST_DIR = path.resolve(__dirname, 'static');
const MANIFEST_PATH = path.join(__dirname, 'data/manifest.json');

module.exports = {
  mode: IS_PRODUCTION ? 'production' : 'development',

  entry: {
    app: './src/js/app.js',
  },

  output: {
    filename: 'js/[name].bundle.[contenthash].js',
    path: DIST_DIR,
    publicPath: '/',
  },

  devtool: IS_PRODUCTION ? false : 'inline-source-map',

  plugins: [
    ...(IS_PRODUCTION
      ? [
          new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
          }),
        ]
      : []),
    new ManifestPlugin({
      fileName: MANIFEST_PATH,
      generate: (seed, files) => {
        let current = {};

        try {
          current = JSON.parse(fs.readFileSync(MANIFEST_PATH, { encoding: 'utf8' }));
          current = Object.keys(current)
            .filter((key) => !key.startsWith('precache-manifest.'))
            .reduce(
              (acc, cur) => ({
                ...acc,
                [cur]: current[cur],
              }),
              {},
            );
        } catch (e) {
          console.error(e); // eslint-disable-line no-console
        }

        return files.reduce((manifest, { name, path: p }) => ({ ...manifest, [name]: p }), { ...seed, ...current });
      },
    }),
    new GenerateSW({
      swDest: path.join(DIST_DIR, 'sw.js'),
      runtimeCaching: [
        {
          urlPattern: new RegExp('^https://fonts.(?:googleapis|gstatic).com/(.*)'),
          handler: 'cacheFirst',
          options: {
            cacheName: 'googleapis',
            expiration: {
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
