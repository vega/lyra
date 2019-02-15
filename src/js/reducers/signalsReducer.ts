import {Map} from 'immutable';
import {ActionType, getType} from 'typesafe-actions';
import {SignalValue} from 'vega-typings/types';
import * as guideActions from '../actions/guideActions';
import * as markActions from '../actions/markActions';
import * as signalActions from '../actions/signalActions';
import {Signal, SignalState} from '../store/factory/Signal';

const ns = require('../util/ns');
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
function initSignalsForMark(state: SignalState, action: ActionType<typeof markActions.addMark | typeof guideActions.addGuide>, props, propName?): SignalState {
  if (!props) {
    // No property values to initialize as signals; return state as-is
    return state;
  }

  // Initialize a signal to hold any specified update property values
  return Object.keys(props).reduce(function(accState, key) {
    if (typeof props[key].value === 'undefined') {
      return accState;
    }

    if (action.type === getType(guideActions.addGuide)) {
      const type = 'guide';
      const name =  propName + '_' + key;
      const signalName = propSg(action.meta, type, name);

      const intermediateState = signalInit(accState, signalName, props[key].value);
      return intermediateState;
    }
    if (action.type === getType(markActions.addMark)) {
      const type = action.payload.props.type;
      const name = key;
      const signalName = propSg(action.meta, type, name);
      const streams = action.payload.streams;

      const intermediateState = signalInit(accState, signalName, props[key].value);
      return streams && streams[signalName] ? setStreams(intermediateState, signalName, streams[signalName]) : intermediateState;
    }
  }, state);
}

// Action has two non-type properties, markId and markType
function deleteSignalsForMark(state: SignalState, action: ActionType<typeof markActions.baseDeleteMark | typeof guideActions.deleteGuide>): SignalState {
  // Create a regular expression which will match any signal that was created
  // for this mark (this works because signal names take a predictable form,
  // using the prop-signal module)
  const markType = action.type === getType(markActions.baseDeleteMark) ? action.payload : 'guide';
  const markSignalRegex = new RegExp('^' + ns(markType + '_' + action.meta));
  return state.filter(function(value, key) {
    return !markSignalRegex.test(key);
  });
}

export function signalsReducer(state: SignalState, action: ActionType<typeof signalActions | typeof markActions.addMark | typeof markActions.baseDeleteMark | typeof guideActions.addGuide | typeof guideActions.deleteGuide>): SignalState {
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

  if (action.type === getType(guideActions.addGuide)) {
    const props = action.payload.encode;
    Object.keys(props).forEach(function(key) {
      state = initSignalsForMark(state, action, props[key], key);
    });
    return state;
  }

  if (action.type === getType(markActions.baseDeleteMark) ||
      action.type === getType(guideActions.deleteGuide)) {
    return deleteSignalsForMark(state, action);
  }

  return state;
}

module.exports = signalsReducer;
