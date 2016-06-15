'use strict';

var ns = require('../util/ns'),
    INIT_SIGNAL = 'INIT_SIGNAL',
    SET_SIGNAL  = 'SET_SIGNAL',
    SET_SIGNAL_STREAMS = 'SET_SIGNAL_STREAMS',
    UNSET_SIGNAL = 'UNSET_SIGNAL';

/**
 * Action creator to initialize a signal.
 *
 * @param {string} signal - Name of a signal to initialize
 * @param {*} value - The initial value of the signal
 * @returns {Object} An action object
 */
function initSignal(signal, value) {
  return {
    type: INIT_SIGNAL,
    signal: ns(signal),
    value: value
  };
}

/**
 * Action creator to configure the initial value of a signal.
 *
 * @param {string} signal - Name of the signal to modify
 * @param {*} value - The value to set as the signal's initial value
 * @returns {Object} An action object
 */
function setSignal(signal, value) {
  return {
    type: SET_SIGNAL,
    signal: ns(signal),
    value: value
  };
}

/**
 * Action creator to configure a property to update based on a stream.
 *
 * @param {string} signal - Name of a signal to connect to a stream
 * @param {Object[]} streams - Array of stream configuration objects
 * @returns {Object} An action object
 */
function setSignalStreams(signal, streams) {
  return {
    type: SET_SIGNAL_STREAMS,
    signal: ns(signal),
    value: streams
  };
}

/**
 * Unset a signal in the current store
 *
 * @param {string} signal - Name of the signal to modify
 * @returns {Object} An action object
 */
function unsetSignal(signal) {
  return {
    type: UNSET_SIGNAL,
    signal: ns(signal)
  };
}

module.exports = {
  // Action Names
  INIT_SIGNAL: INIT_SIGNAL,
  SET_SIGNAL: SET_SIGNAL,
  SET_SIGNAL_STREAMS: SET_SIGNAL_STREAMS,
  UNSET_SIGNAL: UNSET_SIGNAL,

  // Action Creators
  initSignal: initSignal,
  setSignal: setSignal,
  setSignalStreams: setSignalStreams,
  unsetSignal: unsetSignal
};
