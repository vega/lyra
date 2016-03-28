/* eslint new-cap:0 */
'use strict';

var Immutable = require('immutable');

var actions = require('../constants/actions');
var getIn = require('../util/immutable-utils').getIn;
var setIn = require('../util/immutable-utils').setIn;

function inspectorReducer(state, action) {
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
    return action.layerIds.reduce(function(newState, layerId) {
      return setIn(newState, 'expandedLayers.' + layerId, true);
    }, state);
  }

  if (action.type === actions.REMOVE_LAYERS) {
    return action.layerIds.reduce(function(newState, layerId) {
      return newState.delete(layerId);;
    }, state);
  }

  if (action.type === actions.TOGGLE_LAYERS) {
    return action.layerIds.reduce(function(newState, layerId) {
      var key = 'expandedLayers.' + layerId;
      return setIn(newState, key, !getIn(newState, key));
    }, state);
  }

  return state;
}

module.exports = inspectorReducer;
