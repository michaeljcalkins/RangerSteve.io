const webpackMerge = require('webpack-merge')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeJsPlugin = require('optimize-js-plugin')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const commonConfig = require('./base.js')

module.exports = function (env) {
  return webpackMerge(commonConfig(), {
    devtool: 'eval-source-map',
    plugins: [
      // new BundleAnalyzerPlugin(),
      new BrowserSyncPlugin({
        host: 'localhost',
        port: 3000,
        proxy: {
          target: 'http://localhost:3000',
          ws: true
        }
      }),
      new ExtractTextPlugin({
        filename: 'css/app.css',
        allChunks: true,
        disable: false
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
            loader: 'css-loader!sass-loader'
          })
        }
      ]
    }
  })
}
