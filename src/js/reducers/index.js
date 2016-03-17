'use strict';
var combineReducers = require('redux-immutable').combineReducers;
var selectedMark = require('./selectedMark');
var expandedLayers = require('./expanded-layers');

module.exports = combineReducers({
  expandedLayers: require('./expanded-layers'),
  selectedMark: require('./selectedMark')
});
