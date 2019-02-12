/* eslint new-cap:0 */
'use strict';

const immutableUtils = require('../util/immutable-utils');
const getIn = immutableUtils.getIn;
const set = immutableUtils.set;
const str = immutableUtils.str;
const setIn = immutableUtils.setIn;
const deleteKeyFromMap = immutableUtils.deleteKeyFromMap;

import {fromJS, Map} from 'immutable';
import {ActionType, getType} from 'typesafe-actions';
import * as scaleActions from '../actions/scaleActions';
import {ScaleState} from '../store/factory/Scale';

export function scalesReducer(state: ScaleState, action: ActionType<typeof scaleActions>): ScaleState {
  const id = action.meta;

  if (typeof state === 'undefined') {
    return Map();
  }

  if (action.type === getType(scaleActions.addScale)) {
    return set(str(id), action.payload);
  }

  if (action.type === getType(scaleActions.updateScaleProperty)) {
    const p = action.payload;
    return setIn(state, str(id) + '.' + p.property,
      fromJS(p.value));
  }

  if (action.type === getType(scaleActions.amendDataRef)) {
    const p = action.payload;
    const refs = getIn(state, str(id) + '.' + p.property);
    return setIn(state, str(id) + '.' + p.property, refs.push(p.ref));
  }

  if (action.type === getType(scaleActions.deleteScale)) {
    return deleteKeyFromMap(state, str(id));
  }

  return state;
}
