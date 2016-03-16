'use strict';
var combineReducers = require('redux-immutable').combineReducers;
var selectedMark = require('./selectedMark');

module.exports = combineReducers({
  selectedMark: require('./selectedMark')
});
