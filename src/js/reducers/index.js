'use strict';
var combineReducers = require('redux-immutable').combineReducers;

module.exports = combineReducers({
  inspector: require('./inspector'),
  signals: require('./signals')
});
