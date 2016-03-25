'use strict';
var SET_SIGNAL_STREAMS = require('../constants/actions').SET_SIGNAL_STREAMS;
var ns = require('../util/ns');

/**
 * Action creator to configure a property to update based on a stream.
 *
 * @param {string} name - Name of a signal to connect to a stream
 * @param {Object[]} streams - Array of stream configuration objects
 * @returns {Object} An action object
 */
module.exports = function(signal, streams) {
  return {
    type: SET_SIGNAL_STREAMS,
    signal: ns(signal),
    value: streams
  };
};
