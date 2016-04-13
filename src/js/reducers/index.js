'use strict';
var combineReducers = require('redux-immutable').combineReducers;
var undoable = require('redux-undo').default;
var includeAction = require('redux-undo').includeAction;
var UNDO_CHECKPOINT = require('../constants/actions').UNDO_CHECKPOINT;

window.ac = require('redux-undo').ActionCreators;

var rootReducer = combineReducers({
  scene: require('./scene'),
  vega: require('./vega'),
  inspector: require('./inspector'),
  primitives: require('./primitives'),
  signals: require('./signals')
});

module.exports = undoable(function(state, action) {
  var result = rootReducer(state, action);

  // Undoable requires each state to be distinct. To permit creating an undoable
  // checkpoint every time a checkpoint action is received, regardless of what
  // changes have or have not happened, make a trivial mutation to the immutable
  // state map to force the creation of a new state object to save in history.
  return action.type !== UNDO_CHECKPOINT ?
    result.set('temp', true).delete('temp') :
    result;
}, {
  filter: includeAction(UNDO_CHECKPOINT)
});
