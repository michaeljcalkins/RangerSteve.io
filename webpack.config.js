'use strict'

const path = require('path'),
      fs = require('fs'),
      webpack = require('webpack'),
      HappyPack = require('happypack'),
      // autoprefixer = require('autoprefixer'),
      // dev plugins
      BrowserSyncPlugin = require('browser-sync-webpack-plugin'),
      DashboardPlugin = require('webpack-dashboard/plugin'),
      phaserDebugPlugin = path.join(__dirname, '/node_modules/phaser-debug/dist/phaser-debug.js'),
      // production plugins
      JavaScriptObfuscator = require('webpack-obfuscator'),
      // shared plugins
      ExtractTextPlugin = require("extract-text-webpack-plugin"),
      // HTMLWebpackPlugin = require('html-webpack-plugin'),
      // config
      BABEL_CONFIG = JSON.parse(fs.readFileSync('.babelrc.json')),
      isProduction = process.argv[2] === '-p',
      SRC = 'resources/assets/',
      DIST = 'public/'

let sharedConfig = {
  devtool: "cheap-eval-source-map",
  entry: {
    index: path.join(__dirname, SRC + 'js/app.js')
  },
  output: {
    path: path.join(__dirname,'public'),
    filename: 'js/app.js', // if you want cache busting, set string to [name]-hash.js;; if not wanted, leave be!
    publicPath: '/'
  },
  plugins: [
    new ExtractTextPlugin({
      filename: 'css/app.css',
      allChunks: true,
      disable: false
    }),
  ],
  module: {
    noParse: [
      /phaser-debug/
    ],
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

let config = Object.assign({}, sharedConfig)

if (!isProduction) {
  config.resolve.modules = [
    path.resolve(__dirname, "resources/assets"),
    "node_modules"
  ]
  config.resolve.alias = {
    'phaser-debug': phaserDebugPlugin
  }

  config.plugins.concat([
    // new NpmInstallPlugin({
    //   dev: false,
    //   peerDependencies: true,
    // }),
    new BrowserSyncPlugin({
      host: 'localhost',
      port: 3000,
      proxy: {
        target: "http://localhost:3000",
        ws: true
      }
    }),
    new webpack.DllReferencePlugin({
      context: path.join(__dirname, SRC + 'js/app.js'),
      manifest: require("./dll/vendor-manifest.json")
    }),
    // new HappyPack({ id: 'js', verbose: false, threads: 4 }),
    // new HappyPack({ id: 'scss', verbose: false, threads: 4 }),
    // new HappyPack({ id: 'json', verbose: false, threads: 4 }),
    new DashboardPlugin(),
  ])

} else {
 // **** PRODUCTION BUILD ****
  config.devtool = "source-map"
  config.plugins.concat([
    new webpack.DefinePlugin({
       'process.env': {
          'NODE_ENV': `"production"`
      },
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
    new JavaScriptObfuscator({
      selfDefending: true
    })
  ])
}

module.exports = config
