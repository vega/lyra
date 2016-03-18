'use strict';

/**
 * Return an object for the action to expand a set of layers.
 *
 * @param {number[]} layerIds - Array of layer IDs to expand
 * @returns {Object} Redux action
 */
module.exports = function(layerIds) {
  return {
    type: 'EXPAND_LAYERS',
    layerIds: layerIds
  };
};
