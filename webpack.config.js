/* eslint-disable */

var webpack = require( 'webpack' );
var path = require( 'path' );
var HtmlWepbackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    lyra: path.resolve( __dirname, 'src/js/index.js' ),
    // By specifying "vendor" dependencies we can render those vendor files
    // into a separate JS bundle; see the CommonsChunkPlugin usage below
    vendor: [
      'd3',
      'datalib',
      'react',
      'react-dom',
      'vega',
      'vega-lite'
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
        loader: 'babel-loader',
        query: {
          presets: [
            'react'
          ]
        }
      },
      {
        test: /\.scss$/,
        loaders: ['style', 'css', 'sass']
      },
      {
        test: /\.png$/,
        loader: 'file-loader'
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
    // Extract the "vendor" code into
    new HtmlWepbackPlugin({
      filename: './index.html',
      template: './index.html',
      inject: 'body',
      version: require('./package.json').version
    })
  ]
};
