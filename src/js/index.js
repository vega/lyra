/* eslint strict: 0, no-undef: 0, no-unused-expressions: 0 */

// Additional requires to polyfill + browserify package.
require('array.prototype.find');
require('string.prototype.startswith');
require('./transforms');

// Initialize the Model.
model = require('./model');
model.init();

// Initialize components
Sidebars = require('./components');

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
  p._source.init({url: 'http://vega.github.io/vega-editor/app/data/cars.json'}),
  p2._source.init({url: 'http://vega.github.io/vega-editor/app/data/jobs.json'}),
  p3._source.init({url: 'http://vega.github.io/vega-editor/app/data/gapminder.json'})
]).then(function() {
  return model.parse();
}).then(function() {
  Sidebars.forceUpdate();
});
