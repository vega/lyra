'use strict';

var START_RECORDING = 'START_RECORDING',
    STOP_RECORDING = 'STOP_RECORDING',
    RECORD_EVENT = 'RECORD_EVENT',
    DEFINE_SELECTION = 'DEFINE_SELECTION';

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

/**
 * Defines a property of a selection (e.g., a user selects a specific
 * triggering event or project transform definition).
 *
 * @param   {string} selType  The selection type (point, list, interval).
 * @param   {string} property The property being defined (e.g., events, transforms).
 * @param   {object} def      The key of a suggestion to be used as the definition.
 *
 * @returns {Object} A DEFINE_SELECTION Redux action object.
 */
function defineSelection(selType, property, def) {
  return {
    type: DEFINE_SELECTION,
    selType: selType,
    property: property,
    def: def
  };
}

module.exports = {
  // Action Names
  START_RECORDING: START_RECORDING,
  STOP_RECORDING: STOP_RECORDING,
  RECORD_EVENT: RECORD_EVENT,
  DEFINE_SELECTION: DEFINE_SELECTION,

  // Action Creators
  startRecording: startRecording,
  stopRecording: stopRecording,
  recordEvent: recordEvent,
  defineSelection: defineSelection
};
