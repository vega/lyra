/* eslint new-cap:0 */
'use strict';

const immutableUtils = require('../util/immutable-utils');
const str = immutableUtils.str;

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
    return state.set(str(id), action.payload);
  }

  if (action.type === getType(scaleActions.updateScaleProperty)) {
    const p = action.payload;
    return state.setIn([str(id), p.property], p.value);
  }

  if (action.type === getType(scaleActions.amendDataRef)) {
    const p = action.payload;
    const refs = state.getIn([str(id), p.property]);
    return state.setIn([str(id), p.property], refs.push(p.ref));
  }

  if (action.type === getType(scaleActions.deleteScale)) {
    return state.delete(str(id));
  }

  return state;
}
