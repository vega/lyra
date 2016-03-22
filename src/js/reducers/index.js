'use strict';
var combineReducers = require('redux-immutable').combineReducers;
var undoable = require('redux-undo').default;

module.exports = combineReducers({
  scene: require('./scene'),
  vega: require('./vega'),
  inspector: undoable(require('./inspector')),
  primitives: require('./primitives'),
  signals: undoable(require('./signals'))
});
