import {Map, Record, RecordOf} from 'immutable';
import {applyMiddleware, createStore, Store} from 'redux';
// import logger from 'redux-logger';
import ReduxThunk from 'redux-thunk'; // redux-thunk lets us dispatch() functions to create async or multi-stage actions
import rootReducer from '../reducers'; // reducer/index.js returns combinedReducers();
import {DatasetRecord} from './factory/Dataset';
import {GuideRecord} from './factory/Guide';
import {Hints, HintsRecord} from './factory/Hints';
import {Inspector, InspectorRecord} from './factory/Inspector';
import {InteractionRecord} from './factory/Interaction';
import {HistoryRecord} from './factory/History';
import {MarkRecord} from './factory/Mark';
import {PipelineRecord} from './factory/Pipeline';
import {ScaleRecord} from './factory/Scale';
import {defaultSignalState, SignalRecord} from './factory/Signal';
import {VegaReparse, VegaReparseRecord} from './factory/Vega';
import {Walkthrough, WalkthroughRecord} from './factory/Walkthrough';
import {WidgetRecord} from './factory/Widget';
import {LyraGlobalsRecord, LyraGlobals} from './factory/Lyra';

export type VisStateTree = Map<string, Map<string, number |
  PipelineRecord | DatasetRecord | ScaleRecord | GuideRecord |
  MarkRecord | SignalRecord | InteractionRecord | WidgetRecord | HistoryRecord>>;

export interface VisState {
  present: VisStateTree,
  _allStates: VisStateTree[],
  _parentIds: number[],
  _childrenIds: number[][],
  _activeChildIds: number[],
}

export interface LyraState {
  vis: VisState;
  vega: VegaReparseRecord;
  lyra: LyraGlobalsRecord;
  inspector: InspectorRecord;
  walkthrough: WalkthroughRecord;
  hints: HintsRecord;
};

const defaultVisStateTree = Map({
  pipelines: Map<string, PipelineRecord>(),
  datasets: Map<string, DatasetRecord>(),
  scene: Map<string, number>(),
  scales: Map<string, ScaleRecord>(),
  guides: Map<string, GuideRecord>(),
  marks: Map<string, MarkRecord>(),
  interactions: Map<string, InteractionRecord>(),
  widgets: Map<string, WidgetRecord>(),
  signals: defaultSignalState,
});
const getDefaultState = Record<LyraState>({
  vis: {
    present: defaultVisStateTree,
    _allStates: [defaultVisStateTree],
    _parentIds: [null],
    _childrenIds: [[]],
    _activeChildIds: [null]
  },
  vega: VegaReparse(),
  lyra: LyraGlobals(),
  inspector: Inspector(),
  walkthrough: Walkthrough(),
  hints: Hints()
}, 'LyraState');

export type State = RecordOf<LyraState>;

// Create immutable state
export const defaultState = getDefaultState();

function configureStore(initialState: State) {
  return createStore(rootReducer, initialState, applyMiddleware(ReduxThunk));
}

/**
 * This module exports the configured store as a singleton that can be required
 * from anywhere in Lyra
 * @type {Store}
 */
export const store: Store = configureStore(defaultState);
