'use strict';
var SIGNAL_INIT = require('../constants/actions').SIGNAL_INIT;
var ns = require('../util/ns');

/**
 * Action creator to initialize a signal.
 *
 * @param {string} signal - Name of a signal to initialize
 * @param {*} value - The initial value of the signal
 * @returns {Object} An action object
 */
module.exports = function(signal, value) {
  return {
    type: SIGNAL_INIT,
    signal: ns(signal),
    value: value
  };
};
