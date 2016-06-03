'use strict';

var getIn = require('../util/immutable-utils').getIn;
var deleteMark = require('./deleteMark');

/**
 * Action creator to delete all marks in a scene (wipes scene clear). Unusually
 * this "action" doesn't dispatch anything itself, it simply uses deleteMark
 * to clear all of a scene's children.
 *
 * @returns {Function} An async action function
 */
function clearScene() {
  return function(dispatch, getState) {
    var state = getState(),
        sceneId = getIn(state, 'scene.id'),
        sceneChildren = getIn(state, 'marks.' + sceneId + '.marks').toJS();

    sceneChildren.forEach(function(childId) {
      dispatch(deleteMark(childId));
    });
  };
}

module.exports = clearScene;
