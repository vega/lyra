/* eslint new-cap:0 */
'use strict';

const ACTIONS = require('../actions/Names');
const immutableUtils = require('../util/immutable-utils');
const getIn = immutableUtils.getIn;
const set = immutableUtils.set;
const setIn = immutableUtils.setIn;
const deleteKeyFromMap = immutableUtils.deleteKeyFromMap;

import {fromJS, Map} from 'immutable';
// import {ActionType, getType} from 'typesafe-actions';
import * as scaleActions from '../actions/scaleActions';
import {ScaleState} from '../store/factory/Scale';

function scalesReducer(state: ScaleState, action) {
  if (typeof state === 'undefined') {
    return Map();
  }

  if (action.type === ACTIONS.ADD_SCALE) {
    return set(state, action.id, fromJS(action.props));
  }

  if (action.type === ACTIONS.UPDATE_SCALE_PROPERTY) {
    return setIn(state, action.id + '.' + action.property,
      fromJS(action.value));
  }

  if (action.type === ACTIONS.AMEND_DATA_REF) {
    const refs = getIn(state, action.id + '.' + action.property);
    return setIn(state, action.id + '.' + action.property, refs.push(action.ref));
  }

  if (action.type === ACTIONS.DELETE_SCALE) {
    return deleteKeyFromMap(state, action.id);
  }

  return state;
}

module.exports = scalesReducer;
