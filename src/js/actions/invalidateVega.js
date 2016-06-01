'use strict';
var INVALIDATE_VEGA = require('../constants/actions').INVALIDATE_VEGA;

/**
 * Action creator to set a flag which will be used to reparse (destroy and
 * re-create) the vega view representing the Lyra model.
 *
 * @param {boolean} shouldReparse - Whether the view should be recreated on the
 * next store update cycle.
 * @returns {Object} An action object
 */
module.exports = function(shouldReparse) {
  return {
    type: INVALIDATE_VEGA,
    value: !!shouldReparse
  };
};
