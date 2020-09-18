// Use Webpack's `require.context()` method to find all test files. See karma-webpack's
// "alternative usage" https://github.com/webpack/karma-webpack#alternative-usage and
// https://webpack.github.io/docs/context.html for more, ahem, "context".

var appInitializerRE = /(components|\.)\/index.js/;
var testFileRE = /\.test\.js/;

// Build a list of all JS and JSX files in the application source directory
var context = require.context('./src/js', true, /\.jsx?$/);

// `require.context` returns a customized require function: we will invoke that
// function for each file path we actually want to include in our bundle.

// Files must be included in our test bundle in order to be instrumented for
// code coverage reporting. To this end, we start by loading all non-test files
// to ensure we get reports for files that are not yet tested, so that "100%"
// coverage really will be.
//
// The two exceptions are the root index.js file (which is also suppressed via
// IgnorePlugin, see "note also" below) and the root component file which
// renders the root React component into the document; both of these are for
// kicking off the app in a live environment, and cause undesirable side-
// effects when run in a test environment.
//
// It's important to note that the tests will run if we skip this step: we'd
// simply only have coverage reports for files that are actually required from
// our test specs. See https://github.com/deepsweet/istanbul-instrumenter-loader
// for more information.
//
// Note also that Webpack will _parse_ the files even if they are filtered out
// here, so if you want to exclude a file's existence from Webpack entirely then
// an IgnorePlugin in Karma's Webpack configuration is a more thorough solution.
context.keys().filter(function(path) {
  return !testFileRE.test(path) && !appInitializerRE.test(path);
}).forEach(context);

// Finally, extract the test spec files from that list and require them to kick
// off our unit tests.
context.keys().filter(function(path) {
  return testFileRE.test(path);
}).forEach(context);
