/* eslint no-unused-expressions: 0 */
'use strict';

// Additional requires to polyfill + browserify package.
require('array.prototype.find');
require('string.prototype.startswith');
require('./transforms');

// Initialize the Model.
var model = require('./model');
model.init();

// Initialize components
var Sidebars = require('./components');

var g = model.Scene.child('marks.group'),
    p = model.pipeline('cars'),
    p2 = model.pipeline('jobs'),
    p3 = model.pipeline('gapminder');

// Pre-populate state with one rect, one symbol, one text & one line mark
g.child('marks.rect');
g.child('marks.symbol');
g.child('marks.line');
g.child('marks.text');
g.child('marks.area');

Promise.all([
  p._source.init({url: '/data/cars.json'}),
  p2._source.init({url: '/data/jobs.json'}),
  p3._source.init({url: '/data/gapminder.json'})
]).then(function() {
  return model.parse();
}).then(function() {
  Sidebars.forceUpdate();
});

// Expose model and Sidebars globally (via `window`)
global.model = model;
global.Sidebars = Sidebars;
