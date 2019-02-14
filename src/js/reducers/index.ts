import {combineReducers} from 'redux-immutable';
import {datasetsReducer as datasets} from './datasetsReducer';
import {guidesReducer as guides} from './guidesReducer';
import {scalesReducer as scales} from './scalesReducer';
import {pipelinesReducer as pipelines} from './pipelinesReducer';

const undoable = require('./historyReducer');

// order matters here
module.exports = combineReducers({
  vis: undoable(combineReducers({
    signals: require('./signalsReducer'),
    scene: require('./sceneReducer'),
    pipelines,
    datasets,
    scales,
    guides,
    marks: require('./marksReducer')
  })),
  vega: require('./vegaReducer'),
  inspector: require('./inspectorReducer'),
  hints: require('./hintsReducer'),
  walkthrough: require('./walkthroughReducer')
});
