const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

module.exports = {
    entry: ['babel-polyfill', './src/client/clientEntryPoint.js'],
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js', '.jsx']
    },
    module: {
        rules: [
            { test: /\.css$/, loader: 'style-loader!css-loader' },
            {
                test: /\.scss$/,
                loaders: ['style-loader', 'raw-loader', 'sass-loader']
            },
            {
                test: /\.js$/,
                include: [path.resolve(__dirname, 'src')],
                loader: 'babel-loader',
                query: {
                    presets: ['babel-preset-env'].map(require.resolve)
                }
            },
            {
                test: /\.jsx$/,
                include: [path.resolve(__dirname, 'src/react-app')],
                loader: 'babel-loader',
                options: { presets: ['env', 'react'] }
            },
            {
                test: /ImageProblem\.js$/,
                loader: 'string-replace-loader',
                options: {
                    multiple: [
                        {
                            search: 'global.Jimp(?= = require)',
                            replace: 'const Jimp', // '\'jimp/browser/lib/jimp.js\''
                            flags: 'i'
                        }
                    ]
                }
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                ENVIRONMENT: JSON.stringify('BROWSER')
            }
        })
    ]
};
