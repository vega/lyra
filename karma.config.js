var argv = require('yargs').argv;
var path = require('path');

module.exports = function(config) {
  config.set({
    browsers: ['PhantomJS'],

    singleRun: !argv.watch, // just run once by default

    frameworks: ['mocha'],

    // npm i karma-spec-reporter --save-dev
    // displays tests in a nice readable format
    reporters: ['spec', 'coverage'],

    files: [
      // Polyfill for Babel/ES6
      'node_modules/babel-polyfill/dist/polyfill.js',
      // Polyfill to add Function.prototype.bind in PhantomJS
      './node_modules/phantomjs-polyfill/bind-polyfill.js',
      // Test files live alongside source code, but all are loaded from test_index.js
      './test_index.js'
    ],

    preprocessors: {
      // Run our tests enty point through Webpack and sourcemap the output
      './test_index.js': ['webpack', 'sourcemap']
    },

    webpack: {
       devtool: 'inline-source-map',
       resolve: {
        // allow us to avoid including extension name
        extensions: ['', '.js', '.jsx'],

        // required for enzyme to work properly
        alias: {
          'sinon': 'sinon/pkg/sinon'
        }
      },
      module: {
        // don't run the sinon module through babel-loader
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
        // instrument only testing sources with Istanbul
        postLoaders: [
          {
            test: /\.jsx?$/,
            include: path.resolve('./src/js'),
            exclude: /(node_modules|\.test\.js)/,
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
      'karma-webpack',
      'karma-coverage',
      'karma-chrome-launcher',
      'karma-phantomjs-launcher',
      'karma-spec-reporter',
      'karma-sourcemap-loader'
    ],

    coverageReporter: {
      // This instrumentor isn't "required," per se, since Webpack handles the
      // JSX parsing; but including it somehow fixes the coverage report bar
      // graph width rendering bug, so why not.
      instrumenters: {
        'istanbul-react' : require('istanbul-react')
      },
      instrumenter: {
        '**/*.jsx': 'istanbul-react'
      },

      // Don't omit a file from the report just because it has no associated tests
      includeAllSources: true,

      // Render coverage report in HTML format into coverage/
      type: 'html',
      dir: 'coverage/',
      subdir: function(browser) {
        // normalize browser name in coverage output
        return browser.toLowerCase().split(/[ /-]/)[0];
      }
    }
  });
};
