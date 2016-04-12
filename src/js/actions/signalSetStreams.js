'use strict';
var SIGNAL_SET_STREAMS = require('../constants/actions').SIGNAL_SET_STREAMS;
var ns = require('../util/ns');

/**
 * Action creator to configure a property to update based on a stream.
 *
 * @param {string} signal - Name of a signal to connect to a stream
 * @param {Object[]} streams - Array of stream configuration objects
 * @returns {Object} An action object
 */
module.exports = function(signal, streams) {
  return {
    type: SIGNAL_SET_STREAMS,
    signal: ns(signal),
    value: streams
  };
};
