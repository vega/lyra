'use strict';

var TOGGLE_LAYERS = 'TOGGLE_LAYERS',
    EXPAND_LAYERS = 'EXPAND_LAYERS',
    REMOVE_LAYERS = 'REMOVE_LAYERS',
    SELECT_MARK = 'SELECT_MARK',
    SELECT_PIPELINE = 'SELECT_PIPELINE',
    SELECT_SCALE = 'SELECT_SCALE';

/**
 * Return an object for the action to toggle a set of layers.
 *
 * @param {number[]} layerIds - Array of layer IDs to toggle
 * @returns {Object} Redux action
 */
function toggleLayers(layerIds) {
  return {
    type: TOGGLE_LAYERS,
    layerIds: layerIds
  };
}

/**
 * Return an object for the action to expand a set of layers.
 *
 * @param {number[]} layerIds - Array of layer IDs to expand
 * @returns {Object} Redux action
 */
function expandLayers(layerIds) {
  return {
    type: EXPAND_LAYERS,
    layerIds: layerIds
  };
}

/**
 * Remove layers from the expand layers store
 *
 * @param {number[]} layerIds - Array of layer IDs to expand
 * @returns {Object} Redux action
 */
function removeLayers(layerIds) {
  return {
    type: REMOVE_LAYERS,
    layerIds: layerIds
  };
}

function selectMark(markId) {
  return {
    type: SELECT_MARK,
    id: markId
  };
}

function selectPipeline(pipelineId) {
  return {
    type: SELECT_PIPELINE,
    id: pipelineId
  };
}

/**
 * Set selected scale
 * @param {number} id scale ID to show
  * @returns {Object} An action object
 */
function selectScale(id) {
  return {
    type: SELECT_SCALE,
    id: id
  };
}
module.exports = {
  // Action Names
  TOGGLE_LAYERS: TOGGLE_LAYERS,
  EXPAND_LAYERS: EXPAND_LAYERS,
  REMOVE_LAYERS: REMOVE_LAYERS,
  SELECT_MARK: SELECT_MARK,
  SELECT_PIPELINE: SELECT_PIPELINE,
  SELECT_SCALE: SELECT_SCALE,

  // Action Creators
  toggleLayers: toggleLayers,
  expandLayers: expandLayers,
  removeLayers: removeLayers,
  selectMark: selectMark,
  selectPipeline: selectPipeline,
  selectScale: selectScale
};
