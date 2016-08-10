/* eslint new-cap:0 */
'use strict';

var Immutable = require('immutable'),
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

var MIN_LIST_ITEMS = 3,   // Min picked scenegraph items for list selection suggestion.
    MIN_INTERVAL_LEN = 4; // Min click+shiftclick events for interval selection suggestion.

function recordingsReducer(state, action) {
  if (typeof state === 'undefined' ||
      action.type === ACTIONS.START_RECORDING ||
      action.type === ACTIONS.STOP_RECORDING) {

    state = Immutable.fromJS({
      active: action.type === ACTIONS.START_RECORDING,
      summary: {},

      interval: {events: {}, transforms: {}},
      list: {events: {}, transforms: {}},
      point: {events: {}, transforms: {}},
    });
  }

  if (!state.get('active')) {
    return state;
  }

  if (action.type === ACTIONS.RECORD_EVENT) {
    return infer(state, action);
  }

  return state;
}

// Because we use event selector strings as the keys in our state, we cannot
// use our imutils.getIn/setIn which breaks strings apart on dots. Instead, we
// rely on ImmutableJS' internal getIn/setIn directly.
function infer(state, action) {
  var eventLog = action.eventLog,
      clickLog = action.clickLog,
      last  = eventLog[eventLog.length - 1],
      evt   = last.evt,
      item  = last.item,
      dragging = last.dragging,
      evtType  = evt.vegaType,
      evtDef = {type: evtType, filters: []},
      score  = modifiers(evt, evtDef, EVT_SCORES[evtType]),
      evtStr = evtDefToStr(evtDef),
      shiftInt = true, countItems;

  /*
    1. Does this event give us a new selection type we have not yet seen?
   */

  // Drags are always and only associated with interval selections.
  if (evtType === 'mousemove' && dragging) {
    evtType = evtDef.type = 'drag';
    evtStr = evtDefToStr(evtDef);
    score = modifiers(evt, evtDef, EVT_SCORES.DRAG);
    state = state.setIn(['interval', 'events', evtStr], score);
  }

  // Suggest an interval selection if we see 2 consecutive click, shift-click pairs.
  // To avoid unnecessary computation, check this suggestion hasn't been made.
  if (evtType === 'click' && clickLog.length >= MIN_INTERVAL_LEN &&
      !state.getIn(['interval', 'events', evtStr])) {

    for (var i = MIN_INTERVAL_LEN - 1; i >= 0; --i) {
      evt = clickLog[i].evt;
      if (evt.vegaType !== 'click' || evt.shiftKey !== !!(i % 2)) {
        shiftInt = false;
        break;
      }
    }

    evt = last.evt;
    if (shiftInt) {
      state = state.getIn(['interval', 'events', evtStr], score);
    }
  }

  // Recalculate summary statistics and determine if we should create a point
  // or list selection.
  state = summarize(state, evtDef, item);
  countItems = state.getIn(['summary', evtStr, 'items']);
  if (countItems === 1) {
    state = state.setIn(['point', 'events', evtStr], score);
  } else if (countItems === MIN_LIST_ITEMS && evtDef.filters.length) {
    state = state.setIn(['list', 'events', evtStr], score);
  }

  return state;
}

function summarize(state, evtDef, item) {
  var summary = state.get('summary').toJS(),
      evtStr = evtDefToStr(evtDef),
      evtSum = summary[evtStr];

  if (evtSum) {
    evtSum.count++;
    evtSum.items = item ? ++evtSum.items : evtSum.items;
  } else {
    summary[evtStr] = {count: 1, items: item ? 1 : 0};
  }

  return state.mergeDeep({summary: summary});
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
