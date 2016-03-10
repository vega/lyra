// Use Webpack's `require.context()` method to find all test files
// https://webpack.github.io/docs/context.html for more, ahem, "context"

var context = require.context('./src', true, /test\.jsx?$/);
// `require.context` returns a customized require function: invoke that function
// to require each matched test spec file
context.keys().forEach(context);
