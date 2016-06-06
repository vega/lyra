'use strict';
var combineReducers = require('redux-immutable').combineReducers;

// order matters here
module.exports = combineReducers({
  scene: require('./scene'),
  vega: require('./vega'),
  inspector: require('./inspector'),
  marks: require('./marks'),
  scales: require('./scales'),
  signals: require('./signals'),
  walkthrough: require('./walkthrough'),
  hints: require('./hints'),
  pipelines: require('./pipelines')
});
