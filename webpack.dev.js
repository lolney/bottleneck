const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    watch: true,
    devtool: 'source-map',
    module: {
        preLoaders: [{ test: /\.js$/, loader: 'source-map-loader' }]
    }
});
