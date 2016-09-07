/* eslint new-cap:0 */
'use strict';

var Immutable = require('immutable'),
    ACTIONS = require('../actions/Names'),
    immutableUtils = require('../util/immutable-utils'),
    set = immutableUtils.set,
    setIn = immutableUtils.setIn,
    deleteKeyFromMap = immutableUtils.deleteKeyFromMap;

function scalesReducer(state, action) {
  if (typeof state === 'undefined') {
    return Immutable.Map();
  }

  if (action.type === ACTIONS.ADD_SCALE) {
    return set(state, action.id, Immutable.fromJS(action.props));
  }

  if (action.type === ACTIONS.UPDATE_SCALE_PROPERTY) {
    return setIn(state, action.id + '.' + action.property,
      Immutable.fromJS(action.value));
  }

  if (action.type === ACTIONS.DELETE_SCALE) {
    return deleteKeyFromMap(state, action.id);
  }

  return state;
}

module.exports = scalesReducer;
