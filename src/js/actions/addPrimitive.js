'use strict';
var ADD_PRIMITIVE = require('../constants/actions').ADD_PRIMITIVE;
var ns = require('../util/ns');

/**
 * Action creator to configure the initial value of a signal.
 *
 * @param {string} signal - Name of the signal to modify
 * @param {*} value - The value to set as the signal's initial value
 * @returns {Object} An action object
 */
module.exports = function(signal, value) {
  return {
    type: ADD_PRIMITIVE,
    signal: ns(signal),
    value: value
  };
};
