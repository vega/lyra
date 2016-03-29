'use strict';
var REPARSE_MODEL = require('../constants/actions').REPARSE_MODEL;

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
    type: REPARSE_MODEL,
    value: shouldReparse
  };
};
