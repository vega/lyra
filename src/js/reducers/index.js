'use strict';
var combineReducers = require('redux-immutable').combineReducers;

// order matters here
module.exports = combineReducers({
  vega: require('./vegaReducer'),
  signals: require('./signalsReducer'),
  scene: require('./sceneReducer'),
  pipelines: require('./pipelinesReducer'),
  datasets: require('./datasetsReducer'),
  scales: require('./scalesReducer'),
  marks: require('./marksReducer'),
  inspector: require('./inspectorReducer'),
  hints: require('./hintsReducer'),
  walkthrough: require('./walkthroughReducer')
});
