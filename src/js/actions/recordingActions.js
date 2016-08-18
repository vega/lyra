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
 * @param   {string} evtType The type of an event (which may be `drag` for
 *                           `mousemoves` that occur between `mousedown`
 *                           and `mouseup`).
 * @param   {Object} evt     The DOM event object.
 * @param   {Item}   item    The Vega scenegraph item.
 * @param   {number} markId  The Lyra ID of the mark being interacted with.
 * @returns {Object} A RECORD_EVENT redux action.
 */
function recordEvent(evtType, evt, item, markId) {
  return {
    type: RECORD_EVENT,
    evtType: evtType,
    evt: evt,
    item: item,
    itemId: item ? item._id : null,
    markId: markId
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
