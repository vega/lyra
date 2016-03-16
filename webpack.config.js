var webpack = require( 'webpack' );
var path = require( 'path' );

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
    path: path.resolve( __dirname, 'build' ),
    publicPath: '/build/',
    filename: 'js/lyra.js'
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
  resolve: {
    // Permits `require( 'file' )` instead of `require( 'file.jsx' )`
    extensions: [ '', '.js', '.jsx' ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    // Extract the "vendor" code into
    new webpack.optimize.CommonsChunkPlugin(
      'vendor', // chunk name
      'js/vendor.js' // filename
    )
  ]
};
