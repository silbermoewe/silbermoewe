var path = require('path');

module.exports = {
    entry: {
        'app': './src/app.js'
    },
    output: {
        path: path.resolve(__dirname, './dist/'),
        filename: '[name].js'
    },
    devtool: '#eval',
    resolve: {
        root: path.resolve(__dirname, './src/'),
        extensions: ['', '.js']
    },
    module: {
        loaders: [
            {
                test: /\.json$/,
                loader: 'json'
            }
        ]
    }
};
