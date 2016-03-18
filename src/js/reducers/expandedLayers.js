/* eslint new-cap:0 */
'use strict';

var Immutable = window.Immutable = require('immutable');

function selectedMarkReducer(state, action) {
  if (typeof state === 'undefined') {
    return Immutable.Map();
  }
  if (action.type === 'EXPAND_LAYERS') {
    return state.merge(action.layerIds.reduce(function(layers, layerId) {
      layers[layerId] = true;
      return layers;
    }, {}));
  }
  if (action.type === 'TOGGLE_LAYERS') {
    return state.merge(action.layerIds.reduce(function(layers, layerId) {
      // .get does not coerce numbers to strings, so we do that ourselves
      layers[layerId] = !state.get('' + layerId);
      return layers;
    }, {}));
  }
  return state;
}

module.exports = selectedMarkReducer;
