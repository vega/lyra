// Use Webpack's `require.context()` method to find all test files. See karma-webpack's
// "alternative usage" https://github.com/webpack/karma-webpack#alternative-usage and
// https://webpack.github.io/docs/context.html for more, ahem, "context".

var indexFileRE = /index.js/;
var testFileRE = /\.test\.js/;

// Build a list of all JS and JSX files in the application source directory
var context = require.context('./src/js', true, /\.jsx?$/);

// `require.context` returns a customized require function: we will invoke that
// function for each file path we actually want to include in our bundle.

// Files must be included in our test bundle in order to be instrumented for code
// coverage reporting. To this end, we start by filtering the file list down to
// only non-spec, non-index files (index files are excluded because they are
// generally entry points that cause side-effects).
//
// It's important to note that the tests will run if we skip this step: we'd
// simply only have coverage reports for files that are actually required from
// our test specs. See https://github.com/deepsweet/istanbul-instrumenter-loader
// for more information.
context.keys().filter(function( path ) {
  return ! ( indexFileRE.test( path ) || testFileRE.test( path ) );
}).forEach(context);

// Finally, extract the test spec files from that list and require them to kick
// off our unit tests.
context.keys().filter(function( path ) {
  return testFileRE.test( path );
}).forEach(context);
