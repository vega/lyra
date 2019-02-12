/* eslint new-cap:0 */
'use strict';

const ACTIONS = require('../actions/Names');
const immutableUtils = require('../util/immutable-utils');
const getIn = immutableUtils.getIn;
const set = immutableUtils.set;
const setIn = immutableUtils.setIn;
const deleteKeyFromMap = immutableUtils.deleteKeyFromMap;

import {fromJS, Map} from 'immutable';
import {getType} from 'typesafe-actions';
import * as scaleActions from '../actions/scaleActions';
import {ScaleState} from '../store/factory/Scale';

export function scalesReducer(state: ScaleState, action): ScaleState {
  if (typeof state === 'undefined') {
    return Map();
  }

  if (action.type === getType(scaleActions.addScale)) {
    return set(state, action.id, fromJS(action.props));
  }

  if (action.type === getType(scaleActions.updateScaleProperty)) {
    return setIn(state, action.id + '.' + action.property,
      fromJS(action.value));
  }

  if (action.type === getType(scaleActions.amendDataRef)) {
    const refs = getIn(state, action.id + '.' + action.property);
    return setIn(state, action.id + '.' + action.property, refs.push(action.ref));
  }

  if (action.type === getType(scaleActions.deleteScale)) {
    return deleteKeyFromMap(state, action.id);
  }

  return state;
}
