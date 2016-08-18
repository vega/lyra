'use strict';

var dl = require('datalib');

var EVENTS = ['drag', 'click'],
    MIN_DRAG_EVTS = 10,
    MIN_SHIFTCLICK_EVTS = 4,
    EPISILON = 5;

var aggr = dl.groupby(['evtType'])
  .summarize({
    '*': 'values',
    'evt.pageX': ['min', 'max'],
    'evt.pageY': ['min', 'max']
  }),
    prevEvtType;

function record(action) {
  var evtType = action.evtType;
  if (EVENTS.indexOf(evtType) < 0) {
    return;
  }

  if (evtType !== prevEvtType) {
    aggr.clear();
  }

  aggr.insert([action]);
  prevEvtType = evtType;
}

function classifyEvt(state, action) {
  var evtType = action.evtType,
      summary = aggr.result().find(function(x) {
        return x.evtType === evtType;
      });

  if (!summary) {
    return false;
  }

  var values = summary.values,
      rangeX = summary['max_evt.pageX'] - summary['min_evt.pageX'],
      rangeY = summary['max_evt.pageY'] - summary['min_evt.pageY'];

  if (evtType === 'drag' && values.length > MIN_DRAG_EVTS &&
      (rangeX > EPISILON || rangeY > EPISILON)) {
    return true;
  }

  // Test for minimum consecutive click, shift-click pairs.
  if (evtType === 'click' && values.length > MIN_SHIFTCLICK_EVTS) {
    values = values.slice(-MIN_SHIFTCLICK_EVTS);
    for (var i = MIN_SHIFTCLICK_EVTS - 1; i >= 0; --i) {
      if (values[i].evt.shiftKey !== !!(i % 2)) {
        return false;
      }
    }

    return true;
  }

  return false;
}

function reset() {
  aggr.clear();
}

module.exports = {
  record: record,
  classifyEvt: classifyEvt,
  reset: reset
};
