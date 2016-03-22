/* eslint new-cap:0 */
'use strict';

var Immutable = require('immutable');

var actions = require('../constants/actions');

function inspectorReducer(state, action) {
  // Throwaway object
  var tempState;

  if (typeof state === 'undefined') {
    return Immutable.fromJS({
      selected: null,
      expandedLayers: {}
    });
  }

  if (action.type === actions.SELECT_MARK) {
    return state.set('selected', action.markId);
  }

  if (action.type === actions.EXPAND_LAYERS) {
    tempState = state.get('expandedLayers').merge(action.layerIds.reduce(function(layers, layerId) {
      // .get and .set do not coerce numbers to strings, so we do that ourselves
      var id = '' + layerId;
      return layers.set(id, true);
    }, Immutable.Map()));
    return state.set('expandedLayers', tempState);
  }

  if (action.type === actions.TOGGLE_LAYERS) {
    tempState = state.get('expandedLayers').merge(action.layerIds.reduce(function(layers, layerId) {
      var id = '' + layerId;
      return layers.set(id, !state.get('expandedLayers').get(id));
    }, Immutable.Map()));
    return state.set('expandedLayers', tempState);
  }

  return state;
}

module.exports = inspectorReducer;
