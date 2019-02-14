import {ActionType, getType} from 'typesafe-actions';
import * as sceneActions from '../actions/sceneActions';
import {Scene, SceneRecord} from '../store/factory/marks/Scene';

export function sceneReducer(state: SceneRecord, action: ActionType<typeof sceneActions>): SceneRecord {
  if (typeof state === 'undefined') {
    return Scene();
  }

  if (action.type === getType(sceneActions.createScene)) {
    return state.set('_id', action.meta);
  }

  return state;
}
