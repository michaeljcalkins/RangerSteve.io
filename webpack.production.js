const path = require('path'),
      fs = require('fs'),
      webpack = require('webpack'),
      // autoprefixer = require('autoprefixer'),
      // plugins
      ExtractTextPlugin = require("extract-text-webpack-plugin"),
      JavaScriptObfuscator = require('webpack-obfuscator'),
      // HTMLWebpackPlugin = require('html-webpack-plugin'),
      // config
      BABEL_CONFIG = JSON.parse(fs.readFileSync('.babelrc.json')),
      SRC = 'resources/assets/',
      DIST = 'public/'

const config = {
  // uncomment if you want source-maps in production
  // devtool: "source-map",
  entry: {
    index: path.join(__dirname, SRC + 'js/app.js')
  },
  output: {
    path: path.join(__dirname,'public'),
    filename: 'js/app.js', // if you want cache busting, set string to [name]-hash.js;; if not wanted, leave be!
    publicPath: '/'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
          'NODE_ENV': `"production"`
      },
    }),
    new ExtractTextPlugin({
      filename: 'css/app.css',
      allChunks: true,
      disable: false
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    // HTMLWebpackPluginConfig,
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: false,
      mangle: true,
      minimize: true,
      compressor: {
        warnings: false,
        screw_ie8: true,
      }
    }),
    new JavaScriptObfuscator(),
  ],
  module: {
    loaders: [
      {
        test:/\.(js|jsx)$/,
        include: [
          path.join(__dirname, SRC + 'js') // important for performance!
        ], exclude: [/node_modules/, "index.js"], loader: 'babel',
        query: Object.assign({}, BABEL_CONFIG)
      },
      {
        test: /\.scss$/, include: [
          path.join(__dirname, `${SRC}sass/app.scss`) // important for performance!
        ], exclude: /node_modules/,
        loader: ExtractTextPlugin.extract({
          fallbackLoader: 'style',
          loader: 'css!sass'
        }),
      }
    ]
  },
  // postcss: [
  //   autoprefixer({
  //   //************************
  //     browsers: ['last 3 versions']
  //   })
  // ],
  resolve: {
    extensions: ['.scss', '.webpack.js', '.web.js', '.js'],
  },
}

module.exports = config;
