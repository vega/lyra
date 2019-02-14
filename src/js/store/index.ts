import {List, Map, Record, RecordOf} from 'immutable';
import {applyMiddleware, createStore} from 'redux';
import ReduxThunk from 'redux-thunk'; // redux-thunk lets us dispatch() functions to create async or multi-stage actions
import {defaultSignalState, SignalRecord} from '../ctrl/signals/defaults';
import {DatasetRecord} from './factory/Dataset';
import {GuideRecord} from './factory/Guide';
import {MarkRecord} from './factory/Mark';
import {Scene, SceneRecord} from './factory/marks/Scene';
import {PipelineRecord} from './factory/Pipeline';
import {ScaleRecord} from './factory/Scale';
import {VegaReparse, VegaReparseRecord} from './factory/Vega';

// reducer/index.js returns combinedReducers();
const rootReducer = require('../reducers');

type VisStateTree = Map<string, SceneRecord |
      Map<string, PipelineRecord | DatasetRecord | ScaleRecord | GuideRecord | MarkRecord | SignalRecord>>;
export interface VisState {
  past: List<VisStateTree>;
  present: VisStateTree;
  future: List<VisStateTree>;
  filtered: boolean;
}

export interface LyraState {
  vis: VisState;
  vega: VegaReparseRecord;
};

const State = Record<LyraState>({
  vis: {
    past: List(),
    present: Map({
      pipelines: Map<string, PipelineRecord>(),
      datasets: Map<string, DatasetRecord>(),
      scene: Scene(),
      scales: Map<string, ScaleRecord>(),
      guides: Map<string, GuideRecord>(),
      marks: Map<string, MarkRecord>(),
      signals: defaultSignalState,
    }),
    future: List(),
    filtered: false
  },
  vega: VegaReparse(),
});

export type State = RecordOf<LyraState>;

// Create immutable state
const defaultState = State();

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
