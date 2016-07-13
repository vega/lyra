'use strict';

var dl = require('datalib'),
    counter = require('../util/counter'),
    getInVis = require('../util/immutable-utils').getInVis,
    deleteMark = require('./markActions').deleteMark,
    Mark = require('../store/factory/Mark'),
    CREATE_SCENE = 'CREATE_SCENE';


/**
 * Action creator to configure the scene. It generates the default properties
 * of a scene and returns an object that is used to generate the scene within
 * the store and, via the store listener callbacks, to instantiate the scene
 * object.
 *
 * Loading data will require adding an action or altering this action to permit
 * seeding the created scene with preexisting properties.
 *
 * @param {Object} customProps - custom properties
 * @returns {Object} An action object
 */
function createScene(customProps) {
  var id = counter.global();

  return {
    type: CREATE_SCENE,
    id: id,
    name: 'Scene',
    props: Mark('scene', dl.extend({_id: id, name: 'Scene'}, customProps))
  };
}

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
        sceneId = getInVis(state, 'scene.id'),
        sceneChildren = getInVis(state, 'marks.' + sceneId + '.marks').toJS();

    sceneChildren.forEach(function(childId) {
      dispatch(deleteMark(childId));
    });
  };
}

module.exports = {
  // Action Names
  CREATE_SCENE: CREATE_SCENE,

  // Action Creators
  createScene: createScene,
  clearScene: clearScene
};
