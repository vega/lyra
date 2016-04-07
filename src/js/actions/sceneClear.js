'use strict';

var actions = require('../constants/actions');
var PRIMITIVE_DELETE_MARK = actions.PRIMITIVE_DELETE_MARK;
var getIn = require('../util/immutable-utils').getIn;
var markDelete = require('./markDelete');

/**
 * Action creator to delete all marks in a scene (wipes scene clear). Unusually
 * this "action" doesn't dispatch anything itself, it simply uses markDelete
 * to clear all of a scene's children.
 *
 * @returns {Function} An async action function
 */
function sceneClear() {
  return function(dispatch, getState) {
    var state = getState(),
        sceneId = getIn(state, 'scene.id'),
        sceneChildren = getIn(state, 'primitives.' + sceneId + '.marks').toJS();

    sceneChildren.forEach(function(childId) {
      dispatch(markDelete(childId));
    });
  };
};

module.exports = sceneClear;
