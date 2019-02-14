import {Map} from 'immutable';
import {ActionType, getType} from 'typesafe-actions';
import {SignalValue} from 'vega-typings/types';
import * as markActions from '../actions/markActions';
import * as signalActions from '../actions/signalActions';
import {Signal, SignalState} from '../ctrl/signals/defaults';
import ns from '../util/ns';

const propSg = require('../util/prop-signal');

// Initialize a signal to a specific value
function signalInit(state: SignalState, signal: string, value: SignalValue): SignalState {
  return state.set(signal, Signal({
    name: ns(signal),
    value: value,
    _idx: state.size
  }));
}

// Set the streams on a signal
function setStreams(state: SignalState, signal: string, value: SignalValue): SignalState {
  return state.setIn([signal, 'on'], value);
}

// Initialize signals for any of the mark's properties that are defined with a .value
function initSignalsForMark(state: SignalState, action: ActionType<typeof markActions.addMark>, props, propName?): SignalState {
  if (!props) {
    // No property values to initialize as signals; return state as-is
    return state;
  }

  /* eslint no-shadow:0 */
  // Initialize a signal to hold any specified update property values
  return Object.keys(props).reduce(function(accState, key) {
    if (typeof props[key].value === 'undefined') {
      return accState;
    }

    const type = action.type === ACTIONS.ADD_GUIDE ? 'guide' : action.props.type,
        name = action.type === ACTIONS.ADD_GUIDE ? propName + '_' + key : key,
        signalName = propSg(action.id, type, name),
        streams = action.streams;

    const intermediateState = signalInit(accState, signalName, props[key].value);

    return streams && streams[signalName] ? setStreams(intermediateState, signalName, streams[signalName]) : intermediateState;
  }, state);
}

// Action has two non-type properties, markId and markType
function deleteSignalsForMark(state, action) {
  // Create a regular expression which will match any signal that was created
  // for this mark (this works because signal names take a predictable form,
  // using the prop-signal module)
  const markType = action.markType || 'guide',
      markSignalRegex = new RegExp('^' + ns(markType + '_' + action.id));
  return state.filter(function(value, key) {
    return !markSignalRegex.test(key);
  });
}

// @TODO: members of the state.signals map are not actually immutable
function signalsReducer(state: SignalState, action: ActionType<typeof signalActions | typeof markActions.addMark | typeof markActions.baseDeleteMark>): SignalState {
  if (typeof state === 'undefined') {
    return Map();
  }

  if (action.type === getType(signalActions.initSignal)) {
    return signalInit(state, action.meta, action.payload);
  }

  if (action.type === getType(signalActions.setSignal)) {
    return state.setIn([action.meta, 'value'], action.payload);
  }

  if (action.type === getType(signalActions.setSignalStreams)) {
    return setStreams(state, action.meta, action.payload);
  }

  if (action.type === getType(signalActions.unsetSignal)) {
    return state.remove(action.meta);
  }

  if (action.type === getType(markActions.addMark)) {
    return initSignalsForMark(state, action,
      action.payload.props.encode && action.payload.props.encode.update);
  }

  if (action.type === ACTIONS.ADD_GUIDE) {
    const props = action.props.properties;
    Object.keys(props).forEach(function(key) {
      state = initSignalsForMark(state, action, props[key], key);
    });
    return state;
  }

  if (action.type === ACTIONS.DELETE_MARK ||
      action.type === ACTIONS.DELETE_GUIDE) {
    return deleteSignalsForMark(state, action);
  }

  return state;
}

module.exports = signalsReducer;
