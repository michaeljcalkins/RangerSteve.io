const webpack = require("webpack");
const path = require("path");
const ASSET_PATH = path.resolve("resources/assets");
const PUBLIC_PATH = path.join(__dirname, "public");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: "./resources/assets/js/app.js",
  mode: "development",
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ["babel-loader"]
      },
      {
        test: /\.(css|scss)$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader", // translates CSS into CommonJS
          "sass-loader" // compiles Sass to CSS, using Node Sass by default
        ]
      }
    ]
  },
  resolve: {
    alias: {
      lib: path.resolve("./lib"),
      actions: path.join(ASSET_PATH, "/js/actions/")
    },
    extensions: ["*", ".js", ".jsx"]
  },
  output: {
    path: PUBLIC_PATH,
    publicPath: "/",
    filename: "main.js"
  },
  plugins: [
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "[name].css",
      chunkFilename: "[id].css"
    })
  ]
};
