/* eslint new-cap:0 */
'use strict';

var Immutable = require('immutable');
var assign = require('object-assign');

var actions = require('../constants/actions');
var signalRef = require('../util/signal-reference');

// Initialize a signal to a specific value
function initSignal(state, action) {
  return state.set(action.signal, {
    name: action.signal,
    init: action.value,
    _idx: state.size
  });
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
    return initSignal(state, {
      signal: signalRef(action.props.type, action.id, propName),
      value: updateProps[propName].value
    });
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
    return initSignal(initSignal(state, {
      signal: 'vis_width',
      value: action.props.width
    }), {
      signal: 'vis_height',
      value: action.props.height
    });
  }

  if (action.type === actions.INIT_SIGNAL) {
    return initSignal(state, action);
  }

  if (action.type === actions.SET_SIGNAL) {
    return state.set(action.signal, assign({}, state.get(action.signal), {
      init: action.value
    }));
  }

  if (action.type === actions.SET_SIGNAL_STREAMS) {
    return state.set(action.signal, assign({}, state.get(action.signal), {
      streams: action.value
    }));
  }

  if (action.type === actions.UNSET_SIGNAL) {
    return state.delete(action.signal);
  }

  return state;
}

module.exports = signalsReducer;
