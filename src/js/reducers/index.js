'use strict';
var combineReducers = require('redux-immutable').combineReducers;

module.exports = combineReducers({
  expandedLayers: require('./expandedLayers'),
  selectedMark: require('./selectedMark')
});
