/* eslint new-cap:0 */
'use strict';

var dl = require('datalib'),
    ACTIONS = require('../actions/Names'),
    LIMIT = 20,
    IMPLICIT_BATCH = [ACTIONS.SET_SIGNAL, ACTIONS.UPDATE_GUIDE_PROPERTY],
    BATCH_INTERVAL = 500,  // ms to identify new batch for same implicit action.
    batch = 0,
    prevAction, prevTime;

function historyReducer(reducer) {
  return function(state, action) {
    if (typeof state === 'undefined') {
      state = create([], reducer(undefined, {}), []);
    } else if (!dl.isArray(state.past)) {
      state = create([], state, []);
    }

    var imPrev = prevAction && IMPLICIT_BATCH.indexOf(prevAction.type) >= 0,
        imCurr = IMPLICIT_BATCH.indexOf(action.type) >= 0;

    if (action.type === ACTIONS.START_BATCH) {
      ++batch;
    }

    if (action.type === ACTIONS.END_BATCH) {
      --batch;
      return endBatch(state);
    }

    if (imPrev) {
      state = implicitBatch(state, action, imPrev, imCurr);
    }

    if (imCurr) {
      state = implicitBatch(state, action, imPrev, imCurr);
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

    return insert(reducer, state, action);
  };
}

function create(past, present, future, filtered) {
  return {
    past: past, present: present, future: future, filtered: filtered || false
  };
}

// Mark the last operation in a batch as NOT filtered to ensure subsequent
// actions push the state to past.
function endBatch(state) {
  return batch === 0 ?
    create(state.past.slice(0), state.present, state.future.slice(0)) :
    state;
}

/**
 * There are some actions, identified in IMPLICIT_BATCH, that we wish to
 * consider in batch but cannot explicitly identify a start and end point.
 * For example, dragging a mark which emits a number of SET_SIGNAL actions.
 * For such actions, we instead identify their start and end by tracking
 * previous actions and time intervals between implicit batch actions.
 *
 * @param   {Object}   state   Full history state.
 * @param   {Object}   action  Current/incoming redux action
 * @param   {boolean}  imPrev  If the previous action was an implicit batch.
 * @param   {boolean}  imCurr  If the current action is an implicit batch.
 * @returns {Object}   New history state.
 */
function implicitBatch(state, action, imPrev, imCurr) {
  var now = Date.now();

  // We end an implicit batch when the previous (implicit) batch action differs
  // from the current one, or if a sufficient time interval has passed between
  // two successive implicit batch actions of the same type.
  var diffTypes = prevAction && prevAction.type !== action.type,
      sameTypes = prevAction && prevAction.type === action.type,
      longTime = sameTypes && (now - prevTime) >= BATCH_INTERVAL;

  if (imPrev && (diffTypes || longTime)) {
    --batch;
    prevAction = null;
    prevTime = null;
    return endBatch(state);
  }

  // We start a new implicit batch if no previous implicit exists.
  if (imCurr && !prevAction) {
    ++batch;
  }

  prevAction = action;
  prevTime = now;

  return state;
}

function filter(state, action) {
  return batch === 0 && [ACTIONS.ADD_DATASET].indexOf(action.type) < 0;
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

function undo(state) {
  var past = state.past,
      present = state.present,
      future  = state.future,
      newFuture = state.filtered ? future : [present].concat(future);

  if (!past.length) {
    return state;
  }

  return create(
    past.splice(0, past.length - 1),
    past[past.length - 1],
    newFuture
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

module.exports = historyReducer;
