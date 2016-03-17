'use strict';
var combineReducers = require('redux-immutable').combineReducers;
var selectedMark = require('./selectedMark');
var expandedLayers = require('./expandedLayers');

module.exports = combineReducers({
  expandedLayers: require('./expandedLayers'),
  selectedMark: require('./selectedMark')
});
