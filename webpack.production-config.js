/* eslint-disable */

// Set global environment to production, to trigger the use of an optimized
// Redux build
// process.env.NODE_ENV = 'production';

var dl = require('datalib'),
    webpack = require('webpack'),
    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    devCfg  = require('./webpack.config'),
    prodCfg = dl.extend({}, devCfg, {devtool: 'cheap-module-source-map'}),
    rules = prodCfg.module.rules;

// Extract stylesheet.
rules[1].use = ExtractTextPlugin.extract({fallback: 'style-loader', use: ['css-loader', 'sass-loader']});

// Add a DefinePlugin instance to hard-set global environment to "production",
// to trigger the use of an optimized Redux build, etc.
prodCfg.plugins.push.apply(prodCfg.plugins, [
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('production')
    }
  }),
  new ExtractTextPlugin({filename: 'style.css'}),
]);

module.exports = prodCfg;
