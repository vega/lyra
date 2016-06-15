'use strict';
var combineReducers = require('redux-immutable').combineReducers;

// order matters here
module.exports = combineReducers({
  scene: require('./sceneReducer'),
  vega: require('./vegaReducer'),
  inspector: require('./inspectorReducer'),
  marks: require('./marksReducer'),
  scales: require('./scalesReducer'),
  signals: require('./signalsReducer'),
  walkthrough: require('./walkthroughReducer'),
  hints: require('./hintsReducer'),
  pipelines: require('./pipelinesReducer')
});
