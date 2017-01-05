const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const ASSET_PATH = path.resolve('resources/assets')
const APP_FILE_PATH = `${ASSET_PATH}/js/app.js`
const PUBLIC_PATH = 'public'

module.exports = function() {
  return {
    entry: APP_FILE_PATH,
    output: {
      path: PUBLIC_PATH,
      filename: 'js/app.js',
      publicPath: '/',
    },
    resolve: {
      alias: {
        lib: path.resolve('./lib'),
        'react': 'preact-compat',
        'react-dom': 'preact-compat',
        'actions': `${ASSET_PATH}/js/actions/`,
      },
      extensions: ['.scss', '.js'],
    },
    module: {
      loaders: [
        {
          test:/\.(js|jsx)$/,
          loader: 'babel-loader',
          include: [
            `${ASSET_PATH}/js`,
            path.resolve('node_modules', 'preact-compat/src'),
          ],
        },
      ],
    },
  }
}
