/* eslint new-cap:0 */
'use strict';

var dl = require('datalib'),
    ACTIONS = require('../actions/Names'),
    LIMIT  = 20,
    batch = 0;

function historyReducer(reducer) {
  return function(state, action) {
    if (typeof state === 'undefined') {
      state = create([], reducer(undefined, {}), []);
    } else if (!dl.isArray(state.past)) {
      state = create([], state, []);
    }

    if (action.type === ACTIONS.UNDO) {
      return undo(state);
    }

    if (action.type === ACTIONS.REDO) {
      return redo(state);
    }

    if (action.type === ACTIONS.CLEAR_HISTORY) {
      return create([], state.present, []);
    }

    if (action.type === ACTIONS.START_BATCH) {
      ++batch;
    }

    if (action.type === ACTIONS.END_BATCH) {
      --batch;
      return batch === 0 ?
        create(state.past.slice(0), state.present, state.future.slice(0)) :
        state;
    }

    return insert(reducer, state, action);
  };
}

function create(past, present, future, filtered) {
  return {
    past: past, present: present, future: future, filtered: filtered || false
  };
}

function undo(state) {
  var past = state.past,
      present = state.present,
      future  = state.future;

  if (!past.length) {
    return state;
  }

  return create(
    past.splice(0, past.length - 1),
    past[past.length - 1],
    [present].concat(future.splice(0))
  );
}

function redo(state) {
  var past = state.past,
      present = state.present,
      future  = state.future;

  if (!future.length) {
    return state;
  }

  return create(
    past.concat(present),
    future[0],
    future.splice(1)
  );
}

function filter(state, action) {
  return batch === 0 &&
    [ACTIONS.ADD_PIPELINE, ACTIONS.ADD_DATASET, ACTIONS.INIT_DATASET]
      .indexOf(action.type) < 0;
}

function insert(reducer, state, action) {
  var past = state.past,
      present  = state.present,
      filtered = state.filtered,
      newPresent  = reducer(present, action),
      newFiltered = !filter(state, action),
      newPast;

  if (present === newPresent) {
    return state;
  }

  // If the previous action is filtered out, we don't want to save the state it
  // produced in our history. We also guard against erroneously appending the
  // initial state to past if our first new state is filtered.
  if (filtered) {
    newPast = past;
  } else if (newFiltered && !past.length) {
    newPast = past;
    newFiltered = false;
  } else {
    newPast = (past.push(present), past);
  }

  return create(
    newPast.slice(newPast.length > LIMIT ? 1 : 0),
    newPresent,
    [],
    newFiltered
  );
}

module.exports = historyReducer;
