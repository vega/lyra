/* eslint new-cap:0 */
'use strict';

var Immutable = require('immutable');
var actions = require('../constants/actions');
var immutableUtils = require('../util/immutable-utils');
var set = immutableUtils.set;
var setIn = immutableUtils.setIn;

function scaleReducer(state, action) {
  if (typeof state === 'undefined') {
    return Immutable.Map();
  }

  if (action.type === actions.ADD_SCALE) {
    return set(state, action.id, action.props);
  }

  if (action.type === actions.UPDATE_SCALE_PROPERTY) {
    return setIn(state, action.id + 'action.property', action.value);
  }


  return state;
}

module.exports = scaleReducer;
