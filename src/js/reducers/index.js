'use strict';
var combineReducers = require('redux-immutable').combineReducers;

module.exports = combineReducers({
  viewState: require('./viewState'),
  inspector: require('./inspector'),
  signals: require('./signals')
});
