const path = require("path")
const webpack = require("webpack")

module.exports = {
    entry: {
        vendor: [
            "react",
            "react-autobind",
            "react-dom",
            "react-redux",
            "redux",
            "store",
            "classnames",
        ],
    },
    output: {
        path: path.join(__dirname, "public", "dll"),
        filename: "dll.[name].js",
        library: "[name]",
    },
    module: {
        loaders: [
            { test: /\.json$/, loader: "json-loader" },
        ],
    },
    plugins: [
        new webpack.DllPlugin({ // dynamic-linking library
            path: path.join(__dirname, "dll", "[name]-manifest.json"),
            name: "[name]",
            context: path.resolve(__dirname, "resources/assets"),
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin(),
    ],
    resolve: {
        modules: [
            path.resolve(__dirname, "resources/assets"),
            "node_modules",
        ],
    },
    node: {
        // console: true,
        child_process: 'empty',
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        dns: 'empty',
    },
}
