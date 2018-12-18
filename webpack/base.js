const path = require("path");
const ASSET_PATH = path.resolve("resources/assets");
const APP_FILE_PATH = `${ASSET_PATH}/js/app.js`;
const PUBLIC_PATH = "public";

module.exports = function() {
  return {
    entry: APP_FILE_PATH,
    output: {
      path: PUBLIC_PATH,
      filename: "js/app.js",
      publicPath: "/"
    },
    resolve: {
      alias: {
        lib: path.resolve("./lib"),
        actions: `${ASSET_PATH}/js/actions/`
      },
      extensions: [".scss", ".js"]
    },
    module: {
      loaders: [
        {
          test: /\.js?$/,
          loader: "babel",
          exclude: /node_modules/,
          include: ASSET_PATH,
          query: {
            cacheDirectory: true,
            presets: ["react", "es2015"]
          }
        }
      ]
    }
  };
};
