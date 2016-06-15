/* eslint new-cap:0 */
'use strict';

var Immutable = require('immutable'),
    immutils = require('../util/immutable-utils'),
    getIn = immutils.getIn,
    setIn = immutils.setIn,
    ACTIONS = require('../actions/Names'),
    hierarchy = require('../util/hierarchy');

function expandLayers(state, layerIds) {
  return layerIds.reduce(function(newState, layerId) {
    return setIn(newState, 'encodings.expandedLayers.' + layerId, true);
  }, state);
}

function inspectorReducer(state, action) {
  if (typeof state === 'undefined') {
    return Immutable.fromJS({
      pipelines: {
        selectedId: null
      },
      encodings: {
        selectedId:   null,
        selectedType: null,
        expandedLayers: {}
      }
    });
  }

  if (action.type === ACTIONS.SELECT_PIPELINE) {
    return setIn(state, 'pipelines.selectedId', action.id);
  }

  if (action.type === ACTIONS.SELECT_MARK || action.type === ACTIONS.ADD_MARK ||
      action.type === ACTIONS.SELECT_SCALE) {
    state = state.mergeDeep({
      encodings: {
        selectedId:   action.id,
        selectedType: action.type === ACTIONS.ADD_MARK ? ACTIONS.SELECT_MARK : action.type
      }
    });
  }

  if (action.type === ACTIONS.SELECT_MARK) {
    var lookup = require('../model').lookup,
        parentGroupIds = hierarchy.getParentGroupIds(lookup(action.id));

    return expandLayers(state, parentGroupIds);
  }

  // Auto-select new marks
  if (action.type === ACTIONS.ADD_MARK) {
    var layers = {};
    layers[action.props._parent] = true;
    if (action.props.type === 'group') {
      layers[action.id] = true;
    }

    return state.mergeDeep({
      encodings: {expandedLayers: layers}
    });
  }

  if (action.type === ACTIONS.EXPAND_LAYERS) {
    return expandLayers(state, action.layerIds);
  }

  if (action.type === ACTIONS.REMOVE_LAYERS) {
    return action.layerIds.reduce(function(newState, layerId) {
      return newState.delete(layerId);
    }, state);
  }

  if (action.type === ACTIONS.TOGGLE_LAYERS) {
    return action.layerIds.reduce(function(newState, layerId) {
      var key = 'encodings.expandedLayers.' + layerId;
      return setIn(newState, key, !getIn(newState, key));
    }, state);
  }

  return state;
}

module.exports = inspectorReducer;
