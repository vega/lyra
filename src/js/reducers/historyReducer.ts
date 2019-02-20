import {List, Map} from 'immutable';
import {AnyAction, Reducer} from 'redux';
import {getType} from 'typesafe-actions';
import * as datasetActions from '../actions/datasetActions';
import * as guideActions from '../actions/guideActions';
import * as historyActions from '../actions/historyActions';
import * as signalActions from '../actions/signalActions';
import {VisState} from '../store';

const LIMIT = 20;
const IMPLICIT_BATCH = [getType(signalActions.setSignal), getType(guideActions.updateGuideProperty)];
const BATCH_INTERVAL = 500;  // ms to identify new batch for same implicit action.
let batch = 0;
let prevAction;
let prevTime;

export function undoable(reducer: Reducer<Map<string, any>, AnyAction>) {
  return function(state: VisState, action: AnyAction): VisState {
    if (typeof state === 'undefined') {
      state = create(List(), reducer(undefined, {type: undefined}), List());
    } else if (!(state.past instanceof List)) {
      state = create(List(), state, List());
    }

    const imPrev = prevAction && IMPLICIT_BATCH.indexOf(prevAction.type) >= 0;
    const imCurr = IMPLICIT_BATCH.indexOf(action.type) >= 0;

    if (action.type === getType(historyActions.startBatch)) {
      ++batch;
    }

    if (action.type === getType(historyActions.endBatch)) {
      --batch;
      return endBatch(state);
    }

    if (imPrev) {
      state = implicitBatch(state, action, imPrev, imCurr);
    }

    if (imCurr) {
      state = implicitBatch(state, action, imPrev, imCurr);
    }

    if (action.type === getType(historyActions.undo)) {
      return undo(state);
    }

    if (action.type === getType(historyActions.redo)) {
      return redo(state);
    }

    if (action.type === getType(historyActions.clearHistory)) {
      return create(List(), state.present, List());
    }

    return insert(reducer, state, action);
  };
}

function create(past, present, future, filtered?: boolean): VisState {
  return {
    past: past, present: present, future: future, filtered: filtered || false
  };
}

// Mark the last operation in a batch as NOT filtered to ensure subsequent
// actions push the state to past.
function endBatch(state: VisState): VisState {
  return batch === 0 ?
    create(state.past, state.present, state.future) :
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
function implicitBatch(state: VisState, action: AnyAction, imPrev: boolean, imCurr: boolean): VisState {
  const now = Date.now();

  // We end an implicit batch when the previous (implicit) batch action differs
  // from the current one, or if a sufficient time interval has passed between
  // two successive implicit batch actions of the same type.
  const diffTypes = prevAction && prevAction.type !== action.type;
  const sameTypes = prevAction && prevAction.type === action.type;
  const longTime = sameTypes && (now - prevTime) >= BATCH_INTERVAL;

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

function filter(state: VisState, action): boolean {
  return batch === 0 && action.type !== getType(datasetActions.addDataset);
}

function insert(reducer: Reducer<Map<string, any>, AnyAction>, state: VisState, action: AnyAction): VisState {
  const past = state.past;
  const present  = state.present;
  const filtered = state.filtered;
  const newPresent  = reducer(present, action);
  let newFiltered = !filter(state, action);
  let newPast;

  if (present === newPresent) {
    return state;
  }

  // If the previous action is filtered out, we don't want to save the state it
  // produced in our history. We also guard against erroneously appending the
  // initial state to past if our first new state is filtered.
  if (filtered) {
    newPast = past;
  } else if (newFiltered && !past.size) {
    newPast = past;
    newFiltered = false;
  } else {
    newPast = (past.push(present), past);
  }

  return create(
    newPast.size > LIMIT ? newPast.shift() : newPast,
    newPresent,
    List(),
    newFiltered
  );
}

function undo(state: VisState): VisState {
  const past = state.past;
  const present = state.present;
  const future  = state.future;
  const newFuture = state.filtered ? future : List(present).concat(future);

  if (!past.size) {
    return state;
  }

  return create(
    past.pop(),
    past.get(-1),
    newFuture
  );
}

function redo(state: VisState): VisState {
  const past = state.past;
  const present = state.present;
  const future  = state.future;

  if (!future.size) {
    return state;
  }

  return create(
    past.concat(present),
    future.get(0),
    future.shift()
  );
}
