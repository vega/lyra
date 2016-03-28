'use strict';
var INIT_SIGNAL = require('../constants/actions').INIT_SIGNAL;
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
    type: INIT_SIGNAL,
    signal: ns(signal),
    value: value
  };
};
