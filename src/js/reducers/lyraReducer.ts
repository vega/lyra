import {ActionType, getType} from 'typesafe-actions';
import {LyraGlobalsRecord, LyraGlobals} from '../store/factory/Lyra';
import * as lyraActions from '../actions/lyraActions';
/**
 * This reducer handles whether to recreate the view from the lyra ctrl.
 * @param {boolean} state - The existing ctrl reparse value from the store
 * @param {Object} action - The dispatched action indicating how to modify
 * the reparse flag within the store.
 * @returns {boolean} The new state of the reparse flag
 */
export function lyraGlobalsReducer(state: LyraGlobalsRecord,
                              action: ActionType<typeof lyraActions>): LyraGlobalsRecord {
  if (typeof state === 'undefined') {
    return LyraGlobals({
      idCounter: 1
    });
  }

  if (action.type === getType(lyraActions.incrementCounter)) {
    return state.set('idCounter', state.get('idCounter') + 1);
  }

  return state;
}
