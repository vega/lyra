/* eslint-disable */

var path = require('path'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    NotifierPlugin = require('webpack-notifier');

module.exports = {
  entry: {
    lyra: path.resolve( __dirname, 'src/js/index.ts' ),
  },

  output: {
    path: path.resolve(__dirname, 'build'),
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
          'presets': ['@babel/react']
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
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true
        }
      },
    ]
  },

  resolve: {
    // Permits `require( 'file' )` instead of `require( 'file.jsx' )`
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },

  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/index.html'
    }),
    new NotifierPlugin(),
  ],

  optimization: {
    concatenateModules: false,
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        vega: {
          test: /vega/,
          name: 'vega',
          priority: 10,
          reuseExistingChunk: true
        },
        vegaLite: {
          test: /vega-lite/,
          name: 'vega-lite',
          priority: 20,
          reuseExistingChunk: true
        },
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          name: 'vendor',
          reuseExistingChunk: true
        },
        default: {
          name: 'default',
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  }
};
