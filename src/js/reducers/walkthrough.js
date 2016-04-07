/* eslint new-cap:0 */
'use strict';

var Immutable = require('immutable');
var assign = require('object-assign');
var actions = require('../constants/actions');

function walkthroughReducer(state, action) {
  if (typeof state === 'undefined') {
    return Immutable.fromJS({
      data: {},
      activeStep: null,
      activeWalkthrough: null,
      walkthroughMode: false
    });
  }

  if (action.type === actions.SET_ACTIVE_STEP) {
    return state.set('activeStep', action.step);
  }

  if (action.type === actions.SET_ACTIVE_WALKTHROUGH) {
    return state.set('activeWalkthrough', action.key);
  }

  if (action.type === actions.SET_WALKTHROUGH) {
    return state.set(action.key, assign({}, state.get(action.key), action.data));
  }

  if (action.type === actions.SET_WALKTHROUGH_ON) {
    return state.set('walkthroughMode', action.on);
  }

  return state;
}

module.exports = walkthroughReducer;
