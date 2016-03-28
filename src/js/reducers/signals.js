/* eslint new-cap:0 */
'use strict';

var Immutable = require('immutable');
var assign = require('object-assign');

var actions = require('../constants/actions');

// @TODO: members of the state.signals map are not actually immutable
function signalsReducer(state, action) {
  if (typeof state === 'undefined') {
    return Immutable.Map();
  }

  if (action.type === actions.INIT_SIGNAL) {
    return state.set(action.signal, {
      name: action.signal,
      init: action.value,
      _idx: state.size
    });
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
