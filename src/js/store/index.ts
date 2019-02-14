import {Map} from 'immutable';
import {applyMiddleware, createStore} from 'redux';
import ReduxThunk from 'redux-thunk'; // redux-thunk lets us dispatch() functions to create async or multi-stage actions
import {defaultSignalState} from '../ctrl/signals/defaults';
import {DatasetRecord} from './factory/Dataset';
import {MarkRecord} from './factory/Mark';
import {PipelineRecord} from './factory/Pipeline';
import {VegaReparse} from './factory/Vega';

// reducer/index.js returns combinedReducers();
const rootReducer = require('../reducers');

// Create immutable state
// TODO: switch to Record types.
const defaultState = Map({
  vis: Map({
    pipelines: Map<string, PipelineRecord>(),
    datasets: Map<string, DatasetRecord>(),
    scene: Map(),
    scales: Map(),
    guides: Map(),
    marks: Map<string, MarkRecord>(),
    signals: defaultSignalState
  }),
  vega: VegaReparse(),
});

export type State = any;

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
export default configureStore(defaultState);
