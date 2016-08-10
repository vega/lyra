'use strict';

var START_RECORDING = 'START_RECORDING',
    STOP_RECORDING = 'STOP_RECORDING',
    RECORD_EVENT = 'RECORD_EVENT';

/**
 * Return an object to start recording selection demonstrations.
 *
 * @returns {Object} A START_RECORDING Redux action.
 */
function startRecording() {
  return {type: START_RECORDING};
}

/**
 * Return an object to stop recording selection demonstrations.
 *
 * @returns {Object} An STOP_RECORDING Redux action.
 */
function stopRecording() {
  return {type: STOP_RECORDING};
}

/**
 * Records an event as part of the demonstration.
 *
 * @param {Object[]} eventLog An array of objects that holds the event, item,
 *                            and flag to indicate dragging.
 *
 * @param {Object[]} clickLog An array of objects that holds click events,
 *                            corresponding item, and dragging flag.
 *
 * @returns {Object} An RECORD_EVENT Redux action object.
 */
function recordEvent(eventLog, clickLog) {
  return {
    type: RECORD_EVENT,
    eventLog: eventLog,
    clickLog: clickLog
  };
}

module.exports = {
  // Action Names
  START_RECORDING: START_RECORDING,
  STOP_RECORDING: STOP_RECORDING,
  RECORD_EVENT: RECORD_EVENT,

  // Action Creators
  startRecording: startRecording,
  stopRecording: stopRecording,
  recordEvent: recordEvent
};
