var createStore  = require('redux').createStore;
var rootReducer = require('../reducers');

var configureStore = function(initialState) {
  var store = createStore(rootReducer, initialState);
  return store;
}

module.exports = configureStore;
