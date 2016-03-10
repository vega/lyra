var argv = require('yargs').argv;
var path = require('path');

module.exports = function(config) {
  config.set({
    browsers: ['PhantomJS'],
    singleRun: !argv.watch, // just run once by default
    frameworks: ['mocha', 'chai'],
    // npm i karma-spec-reporter --save-dev
    // displays tests in a nice readable format
    reporters: ['spec', 'coverage'],

    files: [
      // Polyfill for Babel/ES6
      'node_modules/babel-polyfill/dist/polyfill.js',
      // Polyfill to add Function.prototype.bind in PhantomJS
      './node_modules/phantomjs-polyfill/bind-polyfill.js',
      // Test files live alongside source code, but all are loaded from tests.js
      './tests.js'
    ],
    preprocessors: {
      // As the tests loader utilizes Webpack's `require.context()`, run it
      // through the Webpack build and instrument the output with sourcemaps
      './tests.js': ['webpack', 'sourcemap']
    },
    webpack: {
       devtool: 'inline-source-map',
       resolve: {
        // allow us to import components in tests like:
        // import Example from 'components/Example';
        root: path.resolve(__dirname, './src'),

        // allow us to avoid including extension name
        extensions: ['', '.js', '.jsx'],

        // required for enzyme to work properly
        alias: {
          'sinon': 'sinon/pkg/sinon'
        }
      },
      module: {
        // don't run babel-loader through the sinon module
        noParse: [
          /node_modules\/sinon\//
        ],
        // run babel loader for our tests
        loaders: [
          {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'babel',
            query: {
              presets: ['react']
            }
          }
        ],
        // Generate coverage after tests have run
        postLoaders: [
          {
            test: /\.jsx?$/,
            exclude: /(test|node_modules)/,
            loader: 'istanbul-instrumenter'
          }
        ]
      },
      // required for enzyme to work properly
      externals: {
        'jsdom': 'window',
        'cheerio': 'window',
        'react/lib/ExecutionEnvironment': true,
        'react/lib/ReactContext': 'window'
      },
    },
    webpackMiddleware: {
      noInfo: true
    },
    // tell karma all the plugins we're going to be using
    plugins: [
      'karma-mocha',
      'karma-chai',
      'karma-webpack',
      'karma-coverage',
      'karma-chrome-launcher',
      'karma-phantomjs-launcher',
      'karma-spec-reporter',
      'karma-sourcemap-loader'
    ],
    coverageReporter: {
      // Render coverage report in HTML format into coverage/
      type: 'html',
      dir: 'coverage/'
    }
  });
};
