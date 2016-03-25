'use strict';
var SET_SIGNAL = require('../constants/actions').SET_SIGNAL;
var ns = require('../util/ns');

/**
 * Action creator to configure the initial value of a signal.
 *
 * @param  {string} name - Name of the signal to modify
 * @param  {*} value - The value to set as the signal's initial value
 * @returns {Object} An action object
 */
module.exports = function(signal, value) {
  return {
    type: SET_SIGNAL,
    signal: ns(signal),
    value: value
  };
};
