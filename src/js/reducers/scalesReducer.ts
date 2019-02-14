import {Map} from 'immutable';
import {ActionType, getType} from 'typesafe-actions';
import * as scaleActions from '../actions/scaleActions';
import {ScaleState} from '../store/factory/Scale';

export function scalesReducer(state: ScaleState, action: ActionType<typeof scaleActions>): ScaleState {
  const id = action.meta;

  if (typeof state === 'undefined') {
    return Map();
  }

  if (action.type === getType(scaleActions.addScale)) {
    return state.set(String(id), action.payload);
  }

  if (action.type === getType(scaleActions.updateScaleProperty)) {
    const p = action.payload;
    return state.setIn([String(id), p.property], p.value);
  }

  if (action.type === getType(scaleActions.amendDataRef)) {
    const p = action.payload;
    const refs = state.getIn([String(id), p.property]);
    return state.setIn([String(id), p.property], refs.push(p.ref));
  }

  if (action.type === getType(scaleActions.deleteScale)) {
    return state.remove(String(id));
  }

  return state;
}
