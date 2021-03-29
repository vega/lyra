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

  if (action.type === getType(historyActions.baseAggregateHistory)) {
    const p = action.payload;
    if (p.dsId === undefined) {
      return state.deleteIn([String(id), '_aggregates', p.key]);
    }
    return state.setIn([String(id), '_aggregates', p.key], p.dsId);
  }

  // TODO: this code is unused
  /*
  if (action.type === ACTIONS.DELETE_DATASET) {
    const plId = action.plId,
        dsId = action.dsId;

    if (getIn(state, plId + '._source') === dsId) {
      throw Error('Cannot delete a history\' source dataset.');
    }

    const key = getIn(state, plId + '._aggregates').findKey(function(aggId) {
      return aggId === dsId;
    });

    return state.deleteIn([plId + '', '_aggregates', key]);
  }
  */

  return state;
}
