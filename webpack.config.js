'use strict'

const
    path = require('path'),
    webpack = require('webpack'),

    // Development Plugins
    BrowserSyncPlugin = require('browser-sync-webpack-plugin'),

    // Production Plugins
    JavaScriptObfuscator = require('webpack-obfuscator'),

    // Shared Plugins
    ExtractTextPlugin = require("extract-text-webpack-plugin"),
    OptimizeJsPlugin = require("optimize-js-plugin"),

    // Analysis Plugins
    // BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin,

    // Config
    isProduction = process.argv[2] === '-p',
    SRC = 'resources/assets',
    APP = `${SRC}/js/app.js`,
    DIST = 'public';

let sharedConfig = {
    devtool: "eval-source-map",
    entry: {
        index: path.join(__dirname, APP),
    },
    output: {
        path: path.join(__dirname, DIST),
        filename: 'js/app.js',
        publicPath: '/',
    },
    plugins: [
        new ExtractTextPlugin({
            filename: 'css/app.css',
            allChunks: true,
            disable: false,
        }),
    ],
    module: {
        loaders: [
            {
                test:/\.(js|jsx)$/,
                include: [
                    path.join(__dirname, `${SRC}/js`),
                    path.resolve('node_modules/preact-compat/src'),
                ],
                loader: 'babel',

            },
            {
                test: /\.scss$/, include: [
                    path.join(__dirname, `${SRC}/sass/app.scss`), // important for performance!
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

let config = Object.assign({}, sharedConfig)

if (! isProduction) {
    /**
     * Development
     */
    config.resolve.modules = [
        path.resolve(__dirname, "resources/assets"),
        "node_modules",
    ]

    config.plugins = [
        new BrowserSyncPlugin({
            host: 'localhost',
            port: 3000,
            proxy: {
                target: "http://localhost:3000",
                ws: true,
            },
        }),
        new ExtractTextPlugin({
            filename: 'css/app.css',
            allChunks: true,
            disable: false,
        }),
        new webpack.DllReferencePlugin({
            context: path.join(__dirname, APP),
            manifest: require("./dll/vendor-manifest.json"),
        }),
        // uncomment to analyze webpack bundle size
        // new BundleAnalyzerPlugin(),
        new OptimizeJsPlugin({
            sourceMap: false,
        }),
    ]
} else {
    /**
     * Production
     */
    config.devtool = "source-map"
    config.plugins = [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': `"production"`,
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
}

module.exports = config
