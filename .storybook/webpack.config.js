// you can use this file to add your custom webpack plugins, loaders and anything you like.
// This is just the basic way to add additional webpack configurations.
// For more information refer the docs: https://storybook.js.org/configurations/custom-webpack-config

// IMPORTANT
// When you add this file, we won't add the default configurations which is similar
// to "React Create App". This only has babel loader to load JavaScript.
const path = require('path');

module.exports = {
    plugins: [
        // your custom plugins
    ],
    module: {
        rules: [
            { test: /\.css$/, loader: 'style-loader!css-loader' },
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
            {
                test: /\.jsx$/,
                include: [path.resolve(__dirname, '../src/react-app')],
                loader: 'babel-loader',
                options: { presets: ['env', 'react'] }
            },
            {
                test: /\.scss$/,
                loaders: ['style-loader', 'raw-loader', 'sass-loader']
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
                test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
                loader: 'file-loader'
            }
        ]
    }
};
