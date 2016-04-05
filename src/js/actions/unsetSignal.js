'use strict';
var UNSET_SIGNAL = require('../constants/actions').UNSET_SIGNAL;
var ns = require('../util/ns');

/**
 * Unset a signal on in the current store
 *
 * @param {string} signal - Name of the signal to modify
 * @returns {Object} An action object
 */
module.exports = function(signal) {
  return {
    type: UNSET_SIGNAL,
    signal: ns(signal)
  };
};
