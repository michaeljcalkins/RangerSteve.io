'use strict'

const path = require('path')
const webpack = require('webpack')

// Plugins
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeJsPlugin = require('optimize-js-plugin')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
const JavaScriptObfuscator = require('webpack-obfuscator')

// Config
const PROD = process.argv[2] === '-p' || process.env.NODE_ENV === 'production'
const ASSET_PATH = 'resources/assets'
const APP_FILE_PATH = './resources/assets/js/app.js'
const PUBLIC_PATH = 'public'

/**
 * These change based on the environment. By default
 * we assume the current environment
 * is "Development".
 */
module.exports = {
  devtool: PROD ? 'source-map' : 'eval-source-map',
  entry: APP_FILE_PATH,
  output: {
    path: PUBLIC_PATH,
    filename: 'js/app.js',
    publicPath: '/',
  },
  plugins: PROD
    ? [
      new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': `'production'`,
        },
      }),
      new ExtractTextPlugin({
        filename: 'css/app.css',
        allChunks: true,
        disable: false,
      }),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.OccurrenceOrderPlugin(),
      new webpack.optimize.UglifyJsPlugin({
        sourceMap: true,
        mangle: true,
        minimize: true,
        compressor: {
          warnings: false,
          screw_ie8: true,
        },
      }),
      new OptimizeJsPlugin({
        sourceMap: false,
      }),
      new JavaScriptObfuscator({
        selfDefending: true,
      }),
    ]
    : [
      new BrowserSyncPlugin({
        host: 'localhost',
        port: 3000,
        proxy: {
          target: 'http://localhost:3000',
          ws: true,
        },
      }),
      new ExtractTextPlugin({
        filename: 'css/app.css',
        allChunks: true,
        disable: false,
      }),
      new OptimizeJsPlugin({
        sourceMap: false,
      }),
    ]
  ,
  module: {
    loaders: [
      {
        test:/\.(js|jsx)$/,
        include: [
          path.join(__dirname, `${ASSET_PATH}/js`),
          path.resolve('node_modules/preact-compat/src'),
        ],
        loader: 'babel',
      },
      {
        test: /\.scss$/, include: [
          path.join(__dirname, `${ASSET_PATH}/sass/app.scss`), // important for performance!
        ], exclude: /node_modules/,
        loader: ExtractTextPlugin.extract({
          fallbackLoader: 'style',
          loader: 'css!sass',
        }),
      },
    ],
  },
  resolve: {
    alias: {
      lib: path.resolve('./lib'),
      'react': 'preact-compat',
      'react-dom': 'preact-compat',
      'actions': path.resolve('./resources/assets/js/actions/'),
    },
    extensions: ['.scss', '.webpack.js', '.web.js', '.js'],
  },
}
