import {Map} from 'immutable';
import {ActionType, getType} from 'typesafe-actions';
import * as sceneActions from '../actions/sceneActions';
import {SceneState} from '../store/factory/marks/Scene';

export function sceneReducer(state: SceneState, action: ActionType<typeof sceneActions>) {
  if (typeof state === 'undefined') {
    return Map();
  }

  if (action.type === getType(sceneActions.createScene)) {
    // TODO(jzong) figure out what this line was supposed to do
    // return state.set('id', action.id);
    return state;
  }

  return state;
}
