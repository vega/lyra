'use strict';
var combineReducers = require('redux-immutable').combineReducers,
    undoable = require('redux-undo').default,
    historyCfg = require('../util/history-utils').config;

// order matters here
module.exports = combineReducers({
  vis: undoable(combineReducers({
    signals: require('./signalsReducer'),
    scene: require('./sceneReducer'),
    pipelines: require('./pipelinesReducer'),
    datasets: require('./datasetsReducer'),
    scales: require('./scalesReducer'),
    guides: require('./guidesReducer'),
    marks: require('./marksReducer')
  }), historyCfg),
  vega: require('./vegaReducer'),
  inspector: require('./inspectorReducer'),
  hints: require('./hintsReducer'),
  walkthrough: require('./walkthroughReducer')
});
