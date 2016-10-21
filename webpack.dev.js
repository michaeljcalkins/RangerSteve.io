const path = require('path'),
      fs = require('fs'),
      webpack = require('webpack'),
      // plugins
      HappyPack = require('happypack'),
      ExtractTextPlugin = require("extract-text-webpack-plugin"),
      BrowserSyncPlugin = require('browser-sync-webpack-plugin'),
      DashboardPlugin = require('webpack-dashboard/plugin'),
      // top keks
      BABEL_CONFIG = JSON.parse(fs.readFileSync('.babelrc.json')),
      SRC = 'resources/assets/',
      DIST = 'public/',
      isProduction = process.env.NODE_ENV === 'production'

// // Phaser webpack config
// var phaserModule = path.join(__dirname, 'node_modules/phaser/')
// var phaser = path.join(phaserModule, 'build/custom/phaser-split.js')
// var pixi = path.join(phaserModule, 'build/custom/pixi.js')
// var p2 = path.join(phaserModule, 'build/custom/p2.js')
const config = {
  devtool:'cheap-eval-source-map',
  entry: {
    index: path.join(__dirname, SRC + 'js/app.js')
  },
  module: {
    preLoaders: [
    {
      test: /\.scss$/, 
      include: [
        path.join(__dirname, SRC + 'sass') // important for performance!
      ],
      loader: ExtractTextPlugin.extract({
        fallbackLoader: 'style',
        loader: 'css!sass'
      }),
      exclude: /node_modules/
    }],
    loaders: [
      // { test: /pixi\.js/, include: pixi, loader: 'expose?PIXI' },
      // { test: /phaser-split\.js$/, include: phaser, loader: 'expose?Phaser' },
      // { test: /p2\.js/, include: p2, loader: 'expose?p2' },
      {
        test:/\.(js|jsx)$/,
        include: [
          path.join(__dirname, SRC + 'js') // important for performance!
        ], exclude: [/node_modules/, "index.js"], loader: 'babel',
        query: Object.assign({cacheDirectory: true}, BABEL_CONFIG)
      },
      
    ],
  },
  output: {
    path: path.join(__dirname,'public'),
    filename: 'js/app.js',
    publicPath: '/'
  },
  resolve: {
    // alias: {
    //   'phaser': phaser,
    //   'pixi': pixi,
    //   'p2': p2,
    // },
    root: path.resolve(__dirname, "resources/assets"),
    extensions: ['', '.scss', '.css', '.webpack.js', '.web.js', '.js'],
    modulesDirectories: ["node_modules"],
  },
  // node: {
  //   console: true,
  //   child_process: 'empty',
  //   fs: 'empty',
  //   net: 'empty',
  //   tls: 'empty',
  // },
  plugins: [
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
    new ExtractTextPlugin({
      filename: 'css/app.css',
      allChunks: true,
      disable: false
    }),
    new webpack.DllReferencePlugin({
      context: path.join(__dirname, SRC + 'js/app.js'),
      manifest: require("./dll/vendor-manifest.json")
    }),
    // new HappyPack({ id: 'js', verbose: false, threads: 4 }),  
    // new HappyPack({ id: 'scss', verbose: false, threads: 4 }),
    // new HappyPack({ id: 'json', verbose: false, threads: 4 }),
    new DashboardPlugin(),
  ]
}

module.exports = config

// Just make sure it has:
// - a build function I can tell heroku to run
// - same build function should sourcemap, minify and obfuscate js
// - dev build that watches and builds unminified
