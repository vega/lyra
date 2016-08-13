/* eslint new-cap:0 */
'use strict';

var dl = require('datalib'),
    Immutable = require('immutable'),
    ACTIONS = require('../actions/Names');

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

var MIN_LIST_ITEMS = 2,   // Min picked scenegraph items for list selection suggestion.
    MIN_INTERVAL_LEN = 4; // Min click+shiftclick events for interval selection suggestion.

function recordingsReducer(state, action) {
  if (typeof state === 'undefined' ||
      action.type === ACTIONS.START_RECORDING ||
      action.type === ACTIONS.STOP_RECORDING) {

    state = Immutable.fromJS({
      active: action.type === ACTIONS.START_RECORDING,

      point: {def: {}, events: {}, transforms: {}},
      list: {def: {}, events: {}, transforms: {}},
      interval: {def: {}, events: {}, transforms: {}}
    });
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
  var entry = action.entry,
      evt   = entry.evt,
      type  = entry.type,
      evtDef = {type: type, filters: []},
      score  = modifiers(evt, evtDef, EVT_SCORES[type.toUpperCase()]),
      evtStr = evtDefToStr(evtDef),
      eventLog = action.eventLog,
      summary  = getSummary(action),
      countItems = summary.distinct_itemId, // discount nulls
      shiftInterval = true;

  // Drags are always and only associated with interval selections.
  if (type === 'drag') {
    return suggestSelection(state, 'interval', evtDef, evtStr, score);
  }

  // Suggest an interval selection if we see 2 consecutive click, shift-click
  // pairs. Check this suggestion hasn't been made to avoid wasted computation.
  if (type === 'click' && eventLog.length >= MIN_INTERVAL_LEN &&
    !state.getIn(['interval', 'events', evtStr])) {

    eventLog = eventLog.slice(-MIN_INTERVAL_LEN);
    for (var l, i = MIN_INTERVAL_LEN - 1; i >= 0; --i) {
      l = eventLog[i];
      if (l.type !== 'click' || l.evt.shiftKey !== !!(i % 2)) {
        shiftInterval = false;
        break;
      }
    }

    eventLog = action.eventLog;
    if (shiftInterval) {
      return suggestSelection(state, 'interval', evtDef, evtStr, score);
    }
  }

  // Use summary to determine if we should create a point or list selection.
  // List selections aren't produced on mouseover/mousemove.
  if (countItems === 1) {
    return suggestSelection(state, 'point', evtDef, evtStr, score);
  } else if (countItems === MIN_LIST_ITEMS && evtDef.filters.length &&
      type !== 'mouseover' && type !== 'mousemove') {
    return suggestSelection(state, 'list', evtDef, evtStr, score);
  }

  return state;
}

function suggestSelection(state, type, evtDef, evtStr, score) {
  return state.setIn([type, 'events', evtStr],
    Immutable.fromJS(dl.extend(evtDef, {_score: score})));
}

function getSummary(action) {
  var EVT_SIG = require('../ctrl/recording').EVT_SIG,
      entry = action.entry;

  return action.summary.find(function(x) {
    return !EVT_SIG.some(function(f) {
      return x[f] !== dl.$(f)(entry);
    });
  });
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
