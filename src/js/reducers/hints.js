/* eslint new-cap:0 */
'use strict';

var Immutable = require('immutable');
var actions = require('../constants/actions');
var hintMap = require('../hints');

function hintsReducer(state, action) {
  if (typeof state === 'undefined') {
    return Immutable.fromJS({
      display: null,
      on: false
    });
  }

  if (action.type === actions.HINTS_CLEAR) {
    return state.set('display', null);
  }

  if (action.type === actions.HINTS_ON) {
    return state.set('on', action.on);
  }

  if (action.type === actions.CREATE_SCENE) {
    return state.set('display', hintMap.CREATE_SCENE);
  }

  return state;
}

module.exports = hintsReducer;
