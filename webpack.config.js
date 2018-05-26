const path = require('path');
const fs = require('fs');

module.exports = {
    entry: './src/client/clientEntryPoint.js',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: 'style-loader!css-loader' },
            {
                test: /\.scss$/,
                loaders: ['style-loader', 'raw-loader', 'sass-loader']
            },
            {
                test: /\.js$/,
                include: [
                    path.resolve(__dirname, 'src'),
                    path.resolve(__dirname, 'node_modules/lance-gg'),
                    fs.realpathSync('./node_modules/lance-gg')
                ],
                loader: 'babel-loader',
                query: {
                    presets: ['babel-preset-env'].map(require.resolve)
                }
            },
            {
                test: /\.jsx$/,
                include: [
                    path.resolve(__dirname, 'src/react-app'),
                ],
                loader: 'babel-loader',
                options: { presets: ['react'] }
            },
        ]
    },
    resolve: {
        alias: { lance: path.resolve(__dirname, 'node_modules/lance-gg/src/') } 
    }
};
