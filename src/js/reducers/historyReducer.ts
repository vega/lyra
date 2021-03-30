import {Map} from 'immutable';
import {ActionType, getType} from 'typesafe-actions';
import * as historyActions from '../actions/historyActions';
import {HistoryState} from '../store/factory/History';

/**
 * Main history reducer function, which generates a new state for the
 * history property store based on the changes specified by the dispatched
 * action object.
 *
 * @param {Object} state - An Immutable.Map state object
 * @param {Object} action - A redux action object
 * @returns {Object} A new Immutable.Map with the changes specified by the action
 */
export function historyReducer(state: HistoryState, action: ActionType<typeof historyActions>): HistoryState {
  const id = action.meta;

  if (typeof state === 'undefined') {
    return Map();
  }

  if (action.type === getType(historyActions.baseAddHistory)) {
    return state.set(String(id), action.payload);
  }

  if (action.type === getType(historyActions.updateHistoryProperty)) {
    const p = action.payload;
    return state.setIn([String(id), p.property], p.value);
  }

  return state;
}
