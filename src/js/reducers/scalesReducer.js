/* eslint new-cap:0 */
'use strict';

var Immutable = require('immutable'),
    ACTIONS = require('../actions/Names'),
    immutableUtils = require('../util/immutable-utils'),
    set = immutableUtils.set,
    setIn = immutableUtils.setIn;

function scaleReducer(state, action) {
  if (typeof state === 'undefined') {
    return Immutable.Map();
  }

  if (action.type === ACTIONS.ADD_SCALE) {
    return set(state, action.id, Immutable.fromJS(action.props));
  }

  if (action.type === ACTIONS.UPDATE_SCALE_PROPERTY) {
    return setIn(state, action.id + 'action.property', action.value);
  }

  return state;
}

module.exports = scaleReducer;
