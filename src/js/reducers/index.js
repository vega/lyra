var combineReducers = require('redux').combineReducers;
var example = require('./example');

var combineAppReducers = combineReducers({
  example
});

module.exports = combineAppReducers;
