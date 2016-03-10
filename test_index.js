// Use Webpack's `require.context()` method to find all test files. See karma-webpack's
// "alternative usage" https://github.com/webpack/karma-webpack#alternative-usage and
// https://webpack.github.io/docs/context.html for more, ahem, "context".

// Require all JS and JSX test spec files
var context = require.context('./src/js', true, /\.test\.jsx?$/);

// `require.context` returns a customized require function: invoke that function
// to require each matched test spec file
context.keys().forEach(context);
