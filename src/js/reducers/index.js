'use strict';
var combineReducers = require('redux-immutable').combineReducers;
var example = require('./example');

module.exports = combineReducers({
  example: example
});
