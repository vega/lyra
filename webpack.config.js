/* eslint-disable */

var path = require('path'),
    webpack = require('webpack'),
    NotifierPlugin = require('webpack-notifier');

module.exports = {
  entry: {
    lyra: path.resolve( __dirname, 'src/js/index.js' ),
    // // By specifying "vendor" dependencies we can render those vendor files
    // // into a separate JS bundle; see the CommonsChunkPlugin usage below
    // vendor: [
    //   'array.prototype.find',
    //   'd3',
    //   'datalib',
    //   'es6-promisify',
    //   'immutable',
    //   'inherits',
    //   'jquery',
    //   'jquery-textcomplete',
    //   'json2csv',
    //   'lodash.ismatch',
    //   'lodash.merge',
    //   'react',
    //   'react-contenteditable',
    //   'react-dom',
    //   'react-modal',
    //   'react-tooltip',
    //   'redux-immutable',
    //   'redux-thunk',
    //   'string.prototype.startswith',
    //   'vega',
    //   'vega-lite',
    //   'vega-scenegraph'
    // ],
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    publicPath: '/build/',
    filename: 'js/[name].js',
    jsonpFunction: '__webpackJsonp__'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          'presets': ['react']
        }
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: [
                require('autoprefixer')
              ]
            }
          },
          {
            loader: 'sass-loader',
            options: {
              outputStyle: 'expanded'
            }
          }
        ]
      },
      {
        test: /\.png$/,
        use: 'file-loader'
      },
      {
        test: /\.html$/,
        use: 'raw-loader'
      },
      {
        test: /\.svg$/,
        loader: 'svg-sprite-loader',
        options: {
          esModule: false
        }
      }
    ]
  },
  resolve: {
    // Permits `require( 'file' )` instead of `require( 'file.jsx' )`
    extensions: ['.js', '.jsx']
  },
  plugins: [
    // new webpack.optimize.CommonsChunkPlugin({name: 'vendor', filename: 'js/vendor.js'}),
    new NotifierPlugin(),
  ]
};
