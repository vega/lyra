/* eslint-disable */

// Set global environment to production, to trigger the use of an optimized
// Redux build
// process.env.NODE_ENV = 'production';

var dl = require('datalib'),
    webpack = require('webpack'),
    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    devCfg  = require('./webpack.config'),
    prodCfg = dl.extend({}, devCfg, {devtool: 'cheap-module-source-map'}),
    loaders = prodCfg.module.loaders;

// Extract stylesheet.
loaders[1].loader = ExtractTextPlugin.extract('style-loader', 'css-loader!sass-loader');

// Add a DefinePlugin instance to hard-set global environment to "production",
// to trigger the use of an optimized Redux build, etc.
prodCfg.plugins.push.apply(prodCfg.plugins, [
  new webpack.optimize.DedupePlugin(),
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('production')
    }
  }),
  new ExtractTextPlugin('style.css'),
]);

module.exports = prodCfg;
