/* eslint new-cap:0 */
'use strict';

var Immutable = require('immutable');
var assign = require('object-assign');

var ns = require('../util/ns');
var actions = require('../constants/actions');
var signalRef = require('../util/signal-reference');
var setIn = require('../util/immutable-utils').setIn;

// Initialize a signal to a specific value
function signalInit(state, action) {
  return state.set(action.signal, Immutable.Map({
    name: action.signal,
    init: action.value,
    _idx: state.size
  }));
}

// Set the streams on a signal
function setStreams(state, action) {
  return setIn(state, action.signal + '.streams', action.value);
}

// Initialize signals for any of the mark's properties that are defined with a .value
function initSignalsForMark(state, action) {
  var updateProps = action.props.properties && action.props.properties.update;

  if (!updateProps) {
    // No property values to initialize as signals; return state as-is
    return state;
  }

  /* eslint no-shadow:0 */
  // Initialize a signal to hold any specified update property values
  return Object.keys(updateProps).reduce(function(state, propName) {
    if (typeof updateProps[propName].value === 'undefined') {
      return state;
    }

    var signalName = signalRef(action.props.type, action.id, propName);
    var intermediateState = signalInit(state, {
      signal: signalName,
      value: updateProps[propName].value
    });

    return action.streams[signalName] ? setStreams(intermediateState, {
      signal: signalName,
      value: action.streams[signalName]
    }) : intermediateState;
  }, state);
}

// @TODO: members of the state.signals map are not actually immutable
function signalsReducer(state, action) {
  if (typeof state === 'undefined') {
    return Immutable.Map();
  }

  if (action.type === actions.PRIMITIVE_ADD_MARK) {
    return initSignalsForMark(state, action);
  }

  if (action.type === actions.CREATE_SCENE) {
    // Initialize the visualization width & height from the scene
    return signalInit(signalInit(state, {
      signal: ns('vis_width'),
      value: action.props.width
    }), {
      signal: ns('vis_height'),
      value: action.props.height
    });
  }

  if (action.type === actions.SIGNAL_INIT) {
    return signalInit(state, action);
  }

  if (action.type === actions.SIGNAL_SET) {
    return setIn(state, action.signal + '.init', action.value);
  }

  if (action.type === actions.SIGNAL_SET_STREAMS) {
    return setStreams(state, action);
  }

  if (action.type === actions.SIGNAL_UNSET) {
    return state.delete(action.signal);
  }

  return state;
}

module.exports = signalsReducer;
