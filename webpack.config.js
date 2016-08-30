/* eslint-disable */

var path = require('path'),
    webpack = require('webpack'),
    NotifierPlugin = require('webpack-notifier');

module.exports = {
  entry: {
    lyra: path.resolve( __dirname, 'src/js/index.js' ),
    // By specifying "vendor" dependencies we can render those vendor files
    // into a separate JS bundle; see the CommonsChunkPlugin usage below
    vendor: [
      'd3',
      'datalib',
      'jquery',
      'jquery-textcomplete',
      'json2csv',
      'lodash.ismatch',
      'lodash.merge',
      'react',
      'react-contenteditable',
      'react-dom',
      'react-modal',
      'react-tooltip',
      'string.prototype.startswith',
      'vega',
      'vega-lite',
      'vega-scenegraph'
    ],
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    publicPath: '/build/',
    filename: 'js/[name].js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loaders: ['react-hot', 'babel-loader?presets[]=react']
      },
      {
        test: /\.scss$/,
        loader: 'style!css!autoprefixer?browsers=last 2 version!sass?outputStyle=expanded'
      },
      {
        test: /\.png$/,
        loader: 'file-loader'
      },
      {
        test: /\.html$/,
        loader: 'raw-loader'
      },
      {
        test: /\.svg$/,
        loader: 'svg-sprite?' + JSON.stringify({
          name: '[name]',
          prefixize: true
        })
      }
    ]
  },
  resolve: {
    // Permits `require( 'file' )` instead of `require( 'file.jsx' )`
    extensions: ['', '.js', '.jsx']
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendor', 'js/vendor.js'),
    new NotifierPlugin(),
  ]
};
