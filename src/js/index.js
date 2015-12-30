// Additional requires to polyfill + browserify package.
// require('es6-promise').polyfill();
require('array.prototype.find');
require('string.prototype.startswith');
require('./transforms');

// Initialize the Model.
model = require('./model');
model.init();

r = model.Scene.child('marks.rect');
p = model.pipeline('cars');
p._source.init({ url: 'http://vega.github.io/vega-editor/app/data/cars.json' })
  .then(function(schema) {
    console.log(schema);
    model.parse();
  })
  .catch(function(err) { console.error(err); });
function f(name) { return p._source.schema()[name]._id; }

p2 = model.pipeline('jobs');
p2._source.init({ url: 'http://vega.github.io/vega-editor/app/data/jobs.json' })
  .then(function(schema) {
    console.log(schema);
    model.parse();
  })
  .catch(function(err) { console.error(err); });
function f2(name) { return p2._source.schema()[name]._id; }

p3 = model.pipeline('gapminder');
p3._source.init({ url: 'http://vega.github.io/vega-editor/app/data/gapminder.json' })
  .then(function(schema) {
    console.log(schema);
    model.parse();
  })
  .catch(function(err) { console.error(err); });
function f2(name) { return p3._source.schema()[name]._id; }

// Components
var React = require('react'),
    ReactDOM = require('react-dom'),
    PipelineList = require('./components/pipelines/PipelineList.jsx');

PipelineListCmpt = ReactDOM.render(
  <PipelineList />,
  d3.select('#pipeline-list').node()
);
