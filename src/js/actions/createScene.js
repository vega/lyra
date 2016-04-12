'use strict';
var CREATE_SCENE = require('../constants/actions').CREATE_SCENE;
var counter = require('../util/counter');

/**
 * Action creator to configure the scene. It generates the default properties
 * of a scene and returns an object that is used to generate the scene within
 * the store and, via the store listener callbacks, to instantiate the scene
 * object.
 *
 * Loading data will require adding an action or altering this action to permit
 * seeding the created scene with preexisting properties.
 *
 * @returns {Object} An action object
 */
module.exports = function() {
  var Scene = require('../model/primitives/marks/Scene');
  var props = Scene.defaultProperties({
    _id: counter.global()
  });

  return {
    type: CREATE_SCENE,
    id: props._id,
    name: 'Scene',
    props: props
  };
};
