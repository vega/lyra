var webpack = require( 'webpack' );
var path = require( 'path' );

module.exports = {
  entry: {
    app: path.resolve( __dirname, 'src/js/index.js' ),
    // By specifying "vendor" dependencies we can render those vendor files
    // into a separate JS bundle
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
    filename: 'build/js/lyra.js'
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
      }
    ]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin(
      'vendor', // chunk name
      path.resolve( __dirname, 'build/js/vendor.js' ) // filename
    )
  ]
};
