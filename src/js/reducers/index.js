'use strict';
var combineReducers = require('redux-immutable').combineReducers;

module.exports = combineReducers({
  vega: require('./vega'),
  inspector: require('./inspector'),
  signals: require('./signals')
});
