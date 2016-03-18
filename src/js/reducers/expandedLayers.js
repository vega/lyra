/* eslint new-cap:0 */
'use strict';

var assign = require('object-assign');
var Immutable = require('immutable');

function selectedMarkReducer(state, action) {
  var newState;
  if (typeof state === 'undefined') {
    return Immutable.Map();
  }
  if (action.type === 'EXPAND_LAYERS') {
    newState = action.layerIds.reduce(function(layers, layerId) {
      layers[layerId] = true;
      return layers;
    }, {});
    return assign({}, state, newState);
  }
  if (action.type === 'TOGGLE_LAYERS') {
    newState = action.layerIds.reduce(function(layers, layerId) {
      layers[layerId] = !state[layerId];
      return layers;
    }, {});
    return assign({}, state, newState);
  }
  return state;
}

module.exports = selectedMarkReducer;
