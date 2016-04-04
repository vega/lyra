/* eslint new-cap:0 */
'use strict';

var Immutable = require('immutable');

var actions = require('../constants/actions');
var getIn = require('../util/immutable-utils').getIn;
var setIn = require('../util/immutable-utils').setIn;

function selectPipeline(state, action) {
  var selectedPipelineId = getIn(state, 'pipelines.selected');

  // If the pipeline that was selected is already open, close it
  if (action.id === selectedPipelineId) {
    return setIn(state, 'pipelines.selected', null);
  }

  // otherwise, switch to the newly-selected pipeline
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
