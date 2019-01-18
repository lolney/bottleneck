const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

module.exports = {
    entry: ['idempotent-babel-polyfill', './src/client/clientEntryPoint.js'],
    output: {
        filename: '[name].bundle.js',
        chunkFilename: '[name].bundle.js',
        path: path.join(__dirname, 'dist'),
        publicPath: 'dist/'
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
                include: [
                    path.resolve(__dirname, 'src'),
                    path.resolve(__dirname, 'node_modules/lance-gg'),
                    path.resolve(__dirname, 'node_modules/jimp'),
                    fs.realpathSync('./node_modules/lance-gg')
                ],
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
                            replace: 'const Jimp',
                            flags: 'i'
                        }
                    ]
                }
            },
            {
                test: /.(ttf|otf|eot|svg|woff|woff2)(\?[a-z0-9]+)?$/,
                loader: 'file-loader',
                options: {
                    publicPath: 'dist/'
                }
            },
            {
                test: /\.(gif|png|jpe?g|svg)$/i,
                use: [
                    'file-loader',
                    {
                        loader: 'image-webpack-loader',
                        options: {
                            bypassOnDebug: true, // webpack@1.x
                            disable: true // webpack@2.x and newer
                        }
                    }
                ]
            },
            { test: /\.tsx?$/, loader: 'awesome-typescript-loader' }
        ]
    },
    resolve: {
        alias: {
            lance: path.resolve(__dirname, 'node_modules/lance-gg/src/'),
            jimp: path.resolve(__dirname, 'node_modules/jimp/')
        }
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                ENVIRONMENT: JSON.stringify('BROWSER')
            }
        })
    ]
};
