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
var ctrl = require('./ctrl');

// Set up the listeners that connect the ctrl to the store
var listeners = require('./store/listeners');

// Bind the listener that will flow changes from the redux store into Vega.
store.subscribe(listeners.createStoreListener(store, ctrl));

// Initializes the Lyra ctrl with a new Scene primitive.
var createScene = require('./actions/sceneActions').createScene;
var addPipeline = require('./actions/pipelineActions').addPipeline;

store.dispatch(createScene({
  width: 600,
  height: 600
}));

store.dispatch(addPipeline({
  name: 'cars'
}, {
  name: 'cars.json',
  url:  '/data/cars.json'
}));

store.dispatch(addPipeline({
  name: 'jobs'
}, {
  name: 'jobs.json',
  url:  '/data/jobs.json'
}));

store.dispatch(addPipeline({
  name: 'gapminder'
}, {
  name: 'gapminder.json',
  url:  '/data/gapminder.json'
}));

require('./components');

// Expose ctrl, store and Sidebars globally (via `window`) for debugging
global.ctrl = ctrl;
global.store = store;
