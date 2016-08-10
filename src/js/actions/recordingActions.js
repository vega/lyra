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
 * @param {Object}   entry The recorded entry, containing the event type,
 *                         event object, and picked scenegraph item.
 * @param {Object}   summary A summary of all events seen during this demonstration.
 * @param {Object[]} eventLog A full history of logged events.
 *
 * @returns {Object} An RECORD_EVENT Redux action object.
 */
function recordEvent(entry, summary, eventLog) {
  return {
    type: RECORD_EVENT,
    entry: entry,
    summary: summary,
    eventLog: eventLog
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
