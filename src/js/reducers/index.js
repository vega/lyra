'use strict';
var combineReducers = require('redux-immutable').combineReducers;

module.exports = combineReducers({
  reparse: require('./reparse'),
  inspector: require('./inspector'),
  signals: require('./signals')
});
