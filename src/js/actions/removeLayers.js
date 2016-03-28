'use strict';

/**
 * Remove layers from the expand layers store
 *
 * @param {number[]} layerIds - Array of layer IDs to expand
 * @returns {Object} Redux action
 */
module.exports = function(layerIds) {
  return {
    type: 'REMOVE_LAYERS',
    layerIds: layerIds
  };
};
