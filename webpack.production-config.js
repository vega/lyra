// Set global environment to production, to trigger the use of an optimized
// Redux build
// process.env.NODE_ENV = 'production';

var webpack = require('webpack');

var devConfig = require('./webpack.config');

var dl = require('datalib');

var productionConfig = dl.extend({}, devConfig, {
  devtool: 'cheap-module-source-map'
});

// Add a DefinePlugin instance to hard-set global environment to "production",
// to trigger the use of an optimized Redux build, etc
productionConfig.plugins.push(new webpack.DefinePlugin({
  'process.env': {
    NODE_ENV: JSON.stringify('production')
  }
}));

module.exports = productionConfig;
