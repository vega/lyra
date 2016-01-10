// Additional requires to polyfill + browserify package.
// require('es6-promise').polyfill();
require('array.prototype.find');
require('string.prototype.startswith');
require('./transforms');

// Initialize the Model.
model = require('./model');
model.init();

// Initialize components
Sidebars = require('./components')

g = model.Scene.child('marks.group');
// g2 = g.child('marks.group');
// g3 = model.Scene.child('marks.group');
r  = g.child('marks.rect');
s  = g.child('marks.symbol');
p  = model.pipeline('cars');
p2 = model.pipeline('jobs');
p3 = model.pipeline('gapminder');

Promise.all([
  p._source.init({ url: 'http://vega.github.io/vega-editor/app/data/cars.json' }),
  p2._source.init({ url: 'http://vega.github.io/vega-editor/app/data/jobs.json' }),
  p3._source.init({ url: 'http://vega.github.io/vega-editor/app/data/gapminder.json' })
]).then(function() {
  return model.parse();
}).then(function() {
  Sidebars.forceUpdate();
  // console.log('lyraselected', model.view.model().scene().items[0].items[0].items[0].items[0].items[0]._id);
  // model.signal('lyra_selected', model.view.model().scene().items[0].items[0].items[0].items[0].items[0])
  //   .update();
})

f = function(name)  { return p._source.schema()[name]._id; }
f2 = function(name) { return p2._source.schema()[name]._id; }
f3 = function(name) { return p3._source.schema()[name]._id; }
