import {Map} from 'immutable';
import {applyMiddleware, createStore} from 'redux';
import ReduxThunk from 'redux-thunk'; // redux-thunk lets us dispatch() functions to create async or multi-stage actions

// reducer/index.js returns combinedReducers();
const rootReducer = require('../reducers');

export type State = any;

// Create immutable state
// TODO: switch to Record types.
const defaultState = Map({
  vis: Map({
    pipelines: Map(),
    datasets: Map(),
    scene: Map(),
    scales: Map(),
    guides: Map(),
    marks: Map(),
    signals: Map(require('../ctrl/signals/defaults').signals)
  })
});

function configureStore(initialState: State) {
  return createStore(rootReducer, initialState, applyMiddleware(ReduxThunk));
}

/**
 * This module exports the configured store as a singleton that can be required
 * from anywhere in Lyra
 * @type {Store}
 */
// TODO: Replace with ES6 export once dependents (e.g., Group.js) have been migrated.
module.exports = configureStore(defaultState);
