import {combineReducers} from 'redux-immutable';
import {datasetsReducer as datasets} from './datasetsReducer';

const undoable = require('./historyReducer');

// order matters here
module.exports = combineReducers({
  vis: undoable(combineReducers({
    signals: require('./signalsReducer'),
    scene: require('./sceneReducer'),
    pipelines: require('./pipelinesReducer'),
    datasets,
    scales: require('./scalesReducer'),
    guides: require('./guidesReducer'),
    marks: require('./marksReducer')
  })),
  vega: require('./vegaReducer'),
  inspector: require('./inspectorReducer'),
  hints: require('./hintsReducer'),
  walkthrough: require('./walkthroughReducer')
});
