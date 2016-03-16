/* eslint new-cap:0 */
'use strict';
var createStore = require('redux').createStore;
var Immutable = require('immutable');

// reducer/index.js returns combinedReducers();
var rootReducer = require('../reducers');

// Create immutable state
var initialState = Immutable.Map();
module.exports = createStore(rootReducer, initialState);
