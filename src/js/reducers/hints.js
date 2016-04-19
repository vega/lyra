/* eslint new-cap:0 */
'use strict';

var Immutable = require('immutable');
var actions = require('../constants/actions');

function hintsReducer(state, action) {
  if (typeof state === 'undefined') {
    return Immutable.fromJS({
      display: null,
      on: true
    });
  }

  if (action.type === actions.HINTS_CLEAR) {
    return state.set('display', null);
  }

  if (action.type === actions.HINTS_ON) {
    return state.set('on', action.on);
  }

  if (action.type === actions.CREATE_SCENE) {
    var sceneHints = require('../hints/scene-hints');
    return state.set('display', sceneHints.CREATE_SCENE);
  }

  if (action.type === actions.MARK_ADD) {
    // require the hintmap in here to prevent loading errors :/
    var hintMap = require('../hints/mark-hints'),
        markType = action.props.type;
    if (hintMap.MARK_ADD[markType]){
      return state.set('display', hintMap.MARK_ADD[markType]);
    }
  }

  return state;
}

module.exports = hintsReducer;
