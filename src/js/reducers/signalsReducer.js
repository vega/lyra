/* eslint new-cap:0 */
'use strict';

var Immutable = require('immutable'),
    ns = require('../util/ns'),
    ACTIONS = require('../actions/Names'),
    propSg = require('../util/prop-signal'),
    setIn = require('../util/immutable-utils').setIn;

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
function initSignalsForMark(state, action, props, propName) {
  if (!props) {
    // No property values to initialize as signals; return state as-is
    return state;
  }

  /* eslint no-shadow:0 */
  // Initialize a signal to hold any specified update property values
  return Object.keys(props).reduce(function(state, key) {
    if (typeof props[key].value === 'undefined') {
      return state;
    }

    var type = action.type === ACTIONS.ADD_GUIDE ? 'guide' : action.props.type,
        name = action.type === ACTIONS.ADD_GUIDE ? propName + '_' + key : key,
        signalName = propSg(action.id, type, name),
        streams = action.streams;

    var intermediateState = signalInit(state, {
      signal: signalName,
      value: props[key].value
    });

    return streams && streams[signalName] ? setStreams(intermediateState, {
      signal: signalName,
      value: streams[signalName]
    }) : intermediateState;
  }, state);
}

// Action has two non-type properties, markId and markType
function deleteSignalsForMark(state, action) {
  // Create a regular expression which will match any signal that was created
  // for this mark (this works because signal names take a predictable form,
  // using the prop-signal module)
  var markType = action.markType || 'guide',
      markSignalRegex = new RegExp('^' + ns(markType + '_' + action.id));
  return state.filter(function(value, key) {
    return !markSignalRegex.test(key);
  });
}

// @TODO: members of the state.signals map are not actually immutable
function signalsReducer(state, action) {
  if (typeof state === 'undefined') {
    return Immutable.Map();
  }

  if (action.type === ACTIONS.INIT_SIGNAL) {
    return signalInit(state, action);
  }

  if (action.type === ACTIONS.SET_SIGNAL) {
    return setIn(state, action.signal + '.init', action.value);
  }

  if (action.type === ACTIONS.SET_SIGNAL_STREAMS) {
    return setStreams(state, action);
  }

  if (action.type === ACTIONS.UNSET_SIGNAL) {
    return state.delete(action.signal);
  }

  if (action.type === ACTIONS.CREATE_SCENE) {
    // Initialize the visualization width & height from the scene
    return signalInit(signalInit(state, {
      signal: ns('vis_width'),
      value: action.props.width
    }), {
      signal: ns('vis_height'),
      value: action.props.height
    });
  }

  if (action.type === ACTIONS.ADD_MARK) {
    return initSignalsForMark(state, action,
      action.props.properties && action.props.properties.update);
  }

  if (action.type === ACTIONS.ADD_GUIDE) {
    var props = action.props.properties;
    state = initSignalsForMark(state, action, props.ticks, 'ticks');
    state = initSignalsForMark(state, action, props.title, 'title');
    state = initSignalsForMark(state, action, props.labels, 'labels');
    state = initSignalsForMark(state, action, props.symbols, 'symbols');
    state = initSignalsForMark(state, action, props.gradient, 'gradient');
    state = initSignalsForMark(state, action, props.axis, 'axis');
    state = initSignalsForMark(state, action, props.legend, 'legend');
    return state;
  }

  if (action.type === ACTIONS.DELETE_MARK ||
      action.type === ACTIONS.DELETE_GUIDE) {
    return deleteSignalsForMark(state, action);
  }

  return state;
}

module.exports = signalsReducer;
