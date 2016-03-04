// Additional requires to polyfill + browserify package.
require('array.prototype.find');
require('string.prototype.startswith');
require('./transforms');

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

// Initialize the Model.
model = require('./model');
model.init();

// Initialize components
Sidebars = require('./components');

var g = model.Scene.child('marks.group'),
    p = model.pipeline('cars'),
    p2 = model.pipeline('jobs'),
    p3 = model.pipeline('gapminder');

// Pre-populate state with one rect, one symbol & one line mark
g.child('marks.rect'),
g.child('marks.symbol');
g.child('marks.line');

Promise.all([
  p._source.init({url: 'http://vega.github.io/vega-editor/app/data/cars.json'}),
  p2._source.init({url: 'http://vega.github.io/vega-editor/app/data/jobs.json'}),
  p3._source.init({url: 'http://vega.github.io/vega-editor/app/data/gapminder.json'})
]).then(function() {
  return model.parse();
}).then(function() {
  Sidebars.forceUpdate();
});
