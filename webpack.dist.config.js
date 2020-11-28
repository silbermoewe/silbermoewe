var webpack = require('webpack');
var _ = require('lodash');

var config = {
    devtool: '#source-map',
    plugins: [
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
            },
        }),
    ],
};

_.defaults(config, require('./webpack.config.js'));

module.exports = config;
