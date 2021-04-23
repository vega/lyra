import {combineReducers} from 'redux-immutable';
import undoable from 'redux-undo';
import {hydrator} from '../ctrl/persist';
import {datasetsReducer as datasets} from './datasetsReducer';
import {guidesReducer as guides} from './guidesReducer';
import {hintsReducer as hints} from './hintsReducer';
import historyOptions from './historyOptions';
import {inspectorReducer as inspector} from './inspectorReducer';
import {interactionsReducer as interactions} from './interactionsReducer';
import {widgetsReducer as widgets} from './widgetsReducer';
import {marksReducer as marks} from './marksReducer';
import {pipelinesReducer as pipelines} from './pipelinesReducer';
import {scalesReducer as scales} from './scalesReducer';
import {sceneReducer as scene} from './sceneReducer';
import {signalsReducer as signals} from './signalsReducer';
import {invalidateVegaReducer as vega} from './vegaReducer';
import {lyraGlobalsReducer as lyra} from './lyraReducer';
import {walkthroughReducer as walkthrough} from './walkthroughReducer';
import {layoutsReducer as layouts} from './layoutsReducer';
import {facetLayoutsReducer as facetLayouts} from './facetLayoutsReducer';

const visReducers = combineReducers({
  signals,
  scene,
  pipelines,
  datasets,
  scales,
  guides,
  marks,
  interactions,
  widgets,
  layouts,
  facetLayouts
});

// order matters here
export default combineReducers({
  vis: undoable(hydrator(visReducers, 'vis'), historyOptions),
  vega,
  lyra: hydrator(lyra, 'lyra'),
  inspector: hydrator(inspector, 'inspector'),
  hints,
  walkthrough,
});
