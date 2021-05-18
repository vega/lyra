import {Map} from 'immutable';
import {ActionType, getType} from 'typesafe-actions';
import {SignalValue} from 'vega-typings/types';
import * as guideActions from '../actions/guideActions';
import * as markActions from '../actions/markActions';
import * as signalActions from '../actions/signalActions';
import * as layoutActions from '../actions/layoutActions';
import {Signal, SignalState} from '../store/factory/Signal';
import {defaultGroupHeight, defaultGroupWidth} from '../store/factory/marks/Group';
import {propSg} from '../util/prop-signal';

const ns = require('../util/ns');

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
function initSignalsForMark(state: SignalState, action: ActionType<typeof markActions.baseAddMark | typeof guideActions.baseAddGuide>, props, propName?): SignalState {
  if (!props) {
    // No property values to initialize as signals; return state as-is
    return state;
  }

  // Initialize a signal to hold any specified update property values
  return Object.keys(props).reduce(function(accState, key) {
    if (typeof props[key] === 'undefined' || typeof props[key].value === 'undefined') {
      return accState;
    }

    if (action.type === getType(guideActions.baseAddGuide)) {
      const type = 'guide';
      const name =  propName + '_' + key;
      const signalName = propSg(action.meta, type, name);

      const intermediateState = signalInit(accState, signalName, props[key].value);
      return intermediateState;
    }
    if (action.type === getType(markActions.baseAddMark)) {
      const type = action.payload.props.type;
      const name = key;
      const signalName = propSg(action.meta, type, name);
      const streams = action.payload.streams;

      const intermediateState = signalInit(accState, signalName, props[key].value);
      return streams && streams[signalName] ? setStreams(intermediateState, signalName, streams[signalName]) : intermediateState;
    }
  }, state);
}

function initSignalsForLayout(state: SignalState, action: ActionType<typeof layoutActions.baseAddGrouptoLayout>) {
  const dir = action.payload.dir;

  if (dir == "top" || dir == "bottom") {
    // add row size and position signals
    state = ["size", "pos"].reduce(function(accState, key) {
      const signalName = propSg(action.meta, "layout", "row_" + String(action.payload.newDim)+"_"+key);
      const val = key == "size" ? defaultGroupHeight: 0;
      const intermediateState = signalInit(accState, signalName, val);
      if (key == "pos"){
        if (dir == "bottom") {
          const update = propSg(action.meta, "layout", action.payload.updateDim.slice(14,-4)+"pos") + " + " + propSg(action.meta, "layout", action.payload.updateDim.slice(14,-4)+"size + 30");// fix hardcoded 30
          return setSignalUpdate(intermediateState, signalName, update);
        } else { // top the original first el now has update to new signal
          const updateSig = propSg(action.meta, "layout", action.payload.updateDim.slice(14,-4)+"pos")
          const update = propSg(action.meta, "layout", "row_"+action.payload.newDim+"_pos") + " + " + propSg(action.meta, "layout", "row_"+action.payload.newDim+"_size + 30");// fix hardcoded 30
          return setSignalUpdate(intermediateState, updateSig, update);
        }
      }
      return intermediateState;
    }, state);
  }
  else if (dir == "left" || dir == "right") {
    // add col size and position signals
    state = ["size", "pos"].reduce(function(accState, key) {
      const signalName = propSg(action.meta, "layout", "col_" +String(action.payload.newDim)+"_"+key);
      const val = key == "size" ? defaultGroupWidth: 0;
      const intermediateState = signalInit(accState, signalName, val);
      if (key == "pos"){
        if (dir == "right") {
          const update = propSg(action.meta, "layout", action.payload.updateDim.slice(14,-4)+"pos") + " + " + propSg(action.meta, "layout", action.payload.updateDim.slice(14,-4)+"size + 30");// fix hardcoded 30
          return setSignalUpdate(intermediateState, signalName, update);
        } else { // left, the original first el now has update to new signal
          const updateSig = propSg(action.meta, "layout", action.payload.updateDim.slice(14,-4)+"pos")
          const update = propSg(action.meta, "layout", "col_"+action.payload.newDim+"_pos") + " + " + propSg(action.meta, "layout", "col_"+action.payload.newDim+"_size + 30");// fix hardcoded 30
          return setSignalUpdate(intermediateState, updateSig, update);
        }
      }
      return intermediateState;
    }, state);
  }
  else {
    // first group the dir is null
    state = ["rowsize", "rowpos", "colsize", "colpos"].reduce(function(accState, key) {
      const signalName = propSg(action.meta, "layout", key.slice(0,3)+"_0_"+key.slice(3));

      let val;
      if (key.slice(0,3) == "row"){
        val = key.slice(3) == "size" ? defaultGroupHeight: 0;
      } else {
        val = key.slice(3) == "size" ? defaultGroupWidth: 0;
      }
      const intermediateState = signalInit(accState, signalName, val);
      return intermediateState;
    }, state);
  }

  // set update property for group size and position signals to layout signals
  let rowSigBase = "row_0";
  let colSigBase = "col_0";
  if (dir == "top" || dir == "bottom") {
    rowSigBase = "row_" + action.payload.newDim;
    colSigBase = action.payload.otherDim.slice(14, -5);  // "lyra_layout_2_col_1_size" -> "col_1"
  } else if (dir == "right" || dir == "left"){
    rowSigBase = action.payload.otherDim.slice(14, -5);  // "lyra_layout_2_col_1_size" -> "col_1"
    colSigBase = "col_" + action.payload.newDim;
  }

  let groupSigName = propSg(action.payload.group._id, "group", "x");
  let signalName = propSg(action.meta, "layout", colSigBase+"_pos");
  state = setSignalUpdate(state, groupSigName, signalName);

  groupSigName = propSg(action.payload.group._id, "group", "y");
  signalName = propSg(action.meta, "layout", rowSigBase+"_pos");
  state = setSignalUpdate(state, groupSigName, signalName);

  groupSigName = propSg(action.payload.group._id, "group", "width");
  signalName = propSg(action.meta, "layout", colSigBase+"_size");
  state = setSignalUpdate(state, groupSigName, signalName);

  groupSigName = propSg(action.payload.group._id, "group", "height");
  signalName = propSg(action.meta, "layout", rowSigBase+"_size");
  state = setSignalUpdate(state, groupSigName, signalName);

  return state;
}

function setSignalUpdate(state: SignalState, signal: string, update: SignalValue) {
  return state.setIn([signal, 'update'], update);
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

export function signalsReducer(state: SignalState, action: ActionType<typeof signalActions | typeof markActions.baseAddMark | typeof markActions.baseDeleteMark | typeof guideActions.baseAddGuide | typeof guideActions.deleteGuide | typeof layoutActions.baseAddGrouptoLayout>): SignalState {
  if (typeof state === 'undefined') {
    return Map();
  }

  if (action.type === getType(signalActions.initSignal)) {
    return signalInit(state, action.meta, action.payload);
  }

  if (action.type === getType(signalActions.baseSetSignal)) {
    return state.setIn([action.meta, 'value'], action.payload);
  }

  if (action.type === getType(signalActions.setSignalStreams)) {
    return setStreams(state, action.meta, action.payload);
  }

  if (action.type === getType(signalActions.unsetSignal)) {
    return state.remove(action.meta);
  }

  if (action.type == getType(signalActions.addSignalUpdate)) {
    return state.setIn([action.meta, 'update'], action.payload);
  }

  if (action.type === getType(layoutActions.baseAddGrouptoLayout)) {
    return initSignalsForLayout(state, action);
  }

  if (action.type === getType(markActions.baseAddMark)) {
    return initSignalsForMark(state, action,
      action.payload.props.encode && action.payload.props.encode.update);
  }

  if (action.type === getType(guideActions.baseAddGuide)) {
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
