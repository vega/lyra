'use strict';
var combineReducers = require('redux-immutable').combineReducers;

module.exports = combineReducers({
  scene: require('./scene'),
  vega: require('./vega'),
  inspector: require('./inspector'),
  primitives: require('./primitives'),
  signals: require('./signals')
});
