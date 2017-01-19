const webpackMerge = require('webpack-merge')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeJsPlugin = require('optimize-js-plugin')

const commonConfig = require('./base.js')

module.exports = function (env) {
  return webpackMerge(commonConfig(), {
    devtool: 'source-map',
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': `'production'`
        }
      }),
      new ExtractTextPlugin({
        filename: 'css/app.css',
        allChunks: true,
        disable: false
      }),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.OccurrenceOrderPlugin(),
      new webpack.optimize.UglifyJsPlugin({
        sourceMap: true,
        mangle: true,
        minimize: true,
        compressor: {
          warnings: false,
          screw_ie8: true
        }
      }),
      new OptimizeJsPlugin({
        sourceMap: false
      })
    ],
    module: {
      loaders: [
        {
          test: /\.scss$/,
          loader: ExtractTextPlugin.extract({
            fallbackLoader: 'style-loader',
            loader: 'css-loader?minimize!sass-loader'
          })
        }
      ]
    }
  })
}
