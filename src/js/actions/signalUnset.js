'use strict';
var SIGNAL_UNSET = require('../constants/actions').SIGNAL_UNSET;
var ns = require('../util/ns');

/**
 * Unset a signal on in the current store
 *
 * @param {string} signal - Name of the signal to modify
 * @returns {Object} An action object
 */
module.exports = function(signal) {
  return {
    type: SIGNAL_UNSET,
    signal: ns(signal)
  };
};
