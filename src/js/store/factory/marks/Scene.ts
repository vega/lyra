'use strict';
var dl = require('datalib'),
    Group = require('./Group');

/**
 * A scene factory.
 * @returns {Object} Additional default properties for the scene.
 */
function Scene() {
  var base = Group();
  return dl.extend(base, {
    width: 500,
    height: 500,
    padding: 'auto',
    background: 'white',
    type: 'scene',
  });
}

Scene.getHandleStreams = function() {
  return {};
};


module.exports = Scene;
