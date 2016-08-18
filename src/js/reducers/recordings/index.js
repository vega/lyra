/* eslint new-cap:0 */
'use strict';

var dl = require('datalib'),
    Immutable = require('immutable'),
    classes = require('./registry'),
    ACTIONS = require('../../actions/Names');

var EVT_SCORES = {
  ALT:    1 << 1,
  CTRL:   1 << 2,
  META:   1 << 3,
  SHIFT:  1 << 4,
  MOUSEMOVE: 1 << 5,
  MOUSEOVER: 1 << 6,
  CLICK:     1 << 7,
  DBLCLICK:  1 << 8,
  DRAG:      1 << 9
};

function recordingsReducer(state, action) {
  if (typeof state === 'undefined' ||
      action.type === ACTIONS.START_RECORDING ||
      action.type === ACTIONS.STOP_RECORDING) {

    state = Immutable.fromJS(dl.keys(classes).reduce(function(acc, k) {
      return (acc[k] = {def: {}, events: {}, transforms: {}}, acc);
    }, {
      active: action.type === ACTIONS.START_RECORDING
    }));
  }

  if (!state.get('active')) {
    return state;
  }

  if (action.type === ACTIONS.RECORD_EVENT) {
    return inferSelection(state, action);
  }

  if (action.type === ACTIONS.DEFINE_SELECTION) {
    return state.setIn([action.selType, 'def', action.property], action.def);
  }

  return state;
}

// Note: as we use event selector strings as the keys in our state, we cannot
// use our imutils.getIn/setIn which breaks strings apart on dots. Instead, we
// rely on ImmutableJS' internal getIn/setIn directly.
function inferSelection(state, action) {
  var evt  = action.evt,
      type = action.evtType,
      evtDef = {type: type, filters: []},
      score  = modifiers(evt, evtDef, EVT_SCORES[type.toUpperCase()]),
      evtStr = evtDefToStr(evtDef);

  dl.keys(classes).some(function(k) {
    if (classes[k].classifyEvt(state, action)) {
      state = state.setIn([k, 'events', evtStr],
        Immutable.fromJS(dl.extend(evtDef, {
          _baseScore: score,
          _score: score,
          _ts: Date.now()
        })
      ));
    }
  });

  return state;
}

function modifiers(evt, evtDef, score) {
  if (evt.shiftKey) {
    evtDef.filters.push('event.shiftKey');
    score |= EVT_SCORES.SHIFT;
  }

  if (evt.altKey) {
    evtDef.filters.push('event.altKey');
    score |= EVT_SCORES.ALT;
  }

  if (evt.ctrlKey) {
    evtDef.filters.push('event.ctrlKey');
    score |= EVT_SCORES.CTRL;
  }

  if (evt.metaKey) {
    evtDef.filters.push('event.metaKey');
    score |= EVT_SCORES.META;
  }

  return score;
}

// TODO: replace with JSON def -> event selector?
function evtDefToStr(def) {
  return JSON.stringify(def);
}

module.exports = recordingsReducer;
