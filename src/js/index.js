/* eslint no-unused-expressions: 0 */
'use strict';

require('../scss/app.scss');

// Additional requires to polyfill + browserify package.
require('array.prototype.find');
require('string.prototype.startswith');
require('./transforms');

// Initialize the Redux store
var store = require('./store');

// Initialize the Model.
var model = require('./model');

var Dataset = require('./model/primitives/data/Dataset');

// Set up the listeners that connect the model to the store
var listeners = require('./store/listeners');

// Bind the listener that will flow changes from the redux store into Vega.
store.subscribe(listeners.createStoreListener(store, model));

// Initializes the Lyra model with a new Scene primitive.
var createScene = require('./actions/createScene');
var createPipeline = require('./actions/createPipeline');
var updatePipelineDataset = require('./actions/updatePipelineDataset');

store.dispatch(createScene({
  width: 600,
  height: 600
}));

store.dispatch(createPipeline('cars'));
var d = new Dataset("cars");

var p = model.pipeline('cars'),
    p2 = model.pipeline('jobs'),
    p3 = model.pipeline('gapminder');

Promise.all([
  d.init({url: '/data/cars.json'}),
  p._source.init({url: '/data/cars.json'}),
  p2._source.init({url: '/data/jobs.json'}),
  p3._source.init({url: '/data/gapminder.json'})
]).then(function() {
  // Initialize components
  var ui = require('./components');
  store.dispatch(updatePipelineDataset('cars', d._id));
});

// Expose model, store and Sidebars globally (via `window`) for debugging
global.model = model;
global.store = store;
