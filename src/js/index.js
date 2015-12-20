// We package all external dependencies together, so re-expose them
// for use from the js console.
d3 = require('d3');
vg = require('vega');
vl = require('vega-lite');
dl = require('datalib');

// Additional requires to polyfill + browserify package.
require('es6-promise').polyfill();
require('array.prototype.find');
require('string.prototype.startswith');
require('./transforms');

// The Lyra Model is our main API. 
module.exports = require('./model');