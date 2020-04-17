import {Map} from 'immutable';
import {ActionType, getType} from 'typesafe-actions';
import * as sceneActions from '../actions/sceneActions';

export function sceneReducer(state: Map<string, number>, action: ActionType<typeof sceneActions>): Map<string, number> {
  if (typeof state === 'undefined') {
    return Map();
  }

  if (action.type === getType(sceneActions.baseCreateScene)) {
    return state.set('_id', action.meta);
  }

  return state;
}
