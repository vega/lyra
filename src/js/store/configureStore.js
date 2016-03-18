'use strict';
var createStore = require('redux').createStore;

// reducer/index.js returns combinedReducers();
var rootReducer = require('../reducers');

module.exports = function configureStore(initialState) {
  return createStore(rootReducer, initialState);
};
