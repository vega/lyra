'use strict';

var counter = require('../util/counter'),
    getIn = require('../util/immutable-utils').getIn,
    deleteMark = require('./markActions').deleteMark,
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
  var Scene = require('../model/primitives/marks/Scene');
  var properties = customProps || {};
  properties._id = counter.global();
  var props = Scene.defaultProperties(properties);

  return {
    type: CREATE_SCENE,
    id: props._id,
    name: 'Scene',
    props: props
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
        sceneId = getIn(state, 'scene.id'),
        sceneChildren = getIn(state, 'marks.' + sceneId + '.marks').toJS();

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
