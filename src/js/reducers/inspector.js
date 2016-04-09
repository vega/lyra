/* eslint new-cap:0 */
'use strict';

var Immutable = require('immutable');

var actions = require('../constants/actions');
var getIn = require('../util/immutable-utils').getIn;
var setIn = require('../util/immutable-utils').setIn;

function selectPipeline(state, action) {
  return setIn(state, 'pipelines.selected', action.id);
}

function inspectorReducer(state, action) {
  if (typeof state === 'undefined') {
    return Immutable.fromJS({
      pipelines: {
        selected: null
      },
      selected: null,
      expandedLayers: {}
    });
  }

  // Auto-select new marks
  if (action.type === actions.MARK_ADD) {
    // Select the mark, then attempt to auto-expand it (and its specified parent)
    return setIn(
      setIn(
        state.set('selected', action.id),
        'expandedLayers.' + action.id,
        true
      ),
      'expandedLayers.' + action.props._parent,
      true
    );
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
      return newState.delete(layerId);
    }, state);
  }

  if (action.type === actions.TOGGLE_LAYERS) {
    return action.layerIds.reduce(function(newState, layerId) {
      var key = 'expandedLayers.' + layerId;
      return setIn(newState, key, !getIn(newState, key));
    }, state);
  }

  if (action.type === actions.PIPELINE_SELECT) {
    return selectPipeline(state, action);
  }

  return state;
}

module.exports = inspectorReducer;
