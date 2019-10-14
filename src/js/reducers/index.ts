import {combineReducers} from 'redux-immutable';
import {datasetsReducer as datasets} from './datasetsReducer';
import {guidesReducer as guides} from './guidesReducer';
import {hintsReducer as hints} from './hintsReducer';
import {undoable} from './historyReducer';
import {inspectorReducer as inspector} from './inspectorReducer';
import {marksReducer as marks} from './marksReducer';
import {pipelinesReducer as pipelines} from './pipelinesReducer';
import {scalesReducer as scales} from './scalesReducer';
import {sceneReducer as scene} from './sceneReducer';
import {signalsReducer as signals} from './signalsReducer';
import {invalidateVegaReducer as vega} from './vegaReducer';
import {walkthroughReducer as walkthrough} from './walkthroughReducer';
import {interactionsReducer as interactions} from './interactionsReducer';

// order matters here
export default combineReducers({
  vis: undoable(combineReducers({
    signals,
    scene,
    pipelines,
    datasets,
    scales,
    guides,
    marks,
    interactions
  })),
  vega,
  inspector,
  hints,
  walkthrough
});
