/* eslint no-unused-expressions: 0 */
'use strict';

require('../scss/app.scss');

// Additional requires to polyfill + browserify package.
require('array.prototype.find');
require('string.prototype.startswith');
require('./transforms');

// Initialize the Redux store
var store = require('./store');
var reparse = require('./actions/reparseModel');

// Initialize the Model.
var model = require('./model');
model.init();

// Initialize components
var ui = require('./components');

var g = model.Scene.child('marks.group'),
    g2 = model.Scene.child('marks.group'),
    p = model.pipeline('cars'),
    p2 = model.pipeline('jobs'),
    p3 = model.pipeline('gapminder');

// Pre-populate state with one rect, one symbol, one text & one line mark
g2.child('marks.line');
// g2.child('marks.symbol');
// g2.child('marks.line');
// g2.child('marks.text');
// g.child('marks.area');

Promise.all([
  p._source.init({url: '/data/cars.json'}),
  p2._source.init({url: '/data/jobs.json'}),
  p3._source.init({url: '/data/gapminder.json'})
]).then(function() {
  // Parse the model to initialize and render the Vega view
  store.dispatch(reparse(true));
}).then(function() {
  ui.forceUpdate();
});

// Expose model, store and Sidebars globally (via `window`) for debugging
global.model = model;
global.store = store;
