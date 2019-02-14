import {combineReducers} from 'redux-immutable';
import {datasetsReducer as datasets} from './datasetsReducer';
import {guidesReducer as guides} from './guidesReducer';
import {marksReducer as marks} from './marksReducer';
import {pipelinesReducer as pipelines} from './pipelinesReducer';
import {scalesReducer as scales} from './scalesReducer';
import {sceneReducer as scene} from './sceneReducer';
import {signalsReducer as signals} from './signalsReducer';
import {invalidateVegaReducer as vega} from './vegaReducer';

const undoable = require('./historyReducer');

// order matters here
module.exports = combineReducers({
  vis: undoable(combineReducers({
    signals,
    scene,
    pipelines,
    datasets,
    scales,
    guides,
    marks
  })),
  vega,
  inspector: require('./inspectorReducer'),
  hints: require('./hintsReducer'),
  walkthrough: require('./walkthroughReducer')
});
