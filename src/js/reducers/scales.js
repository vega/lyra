/* eslint new-cap:0 */
'use strict';

var Immutable = require('immutable');
var actions = require('../constants/actions');

function scaleReducer(state, action) {
  if (typeof state === 'undefined') {
    return Immutable.Map();
  }

  if (action.type === actions.ADD_SCALE) {
    return state.set('id', action.id);
  }

  return state;
}

module.exports = scaleReducer;
