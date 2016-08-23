'use strict';

var dl = require('datalib');

var EVENTS = ['drag', 'click'],
    MIN_DRAG_EVTS = 10,
    MIN_SHIFTCLICK_EVTS = 4,
    EPISILON = 10,
    EPISILON_CLICK = 20,
    DIM_SCORES = {
      BOTH:   1 << 5,
      SINGLE: 1.5 * (1 << 5)
    };

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

function classify(state, action) {
  var evtType = action.evtType,
      summary = aggr.result().find(function(x) {
        return x.evtType === evtType;
      });

  if (!summary) {
    return {interval: false};
  }

  var values = summary.values,
      rangeX = summary['max_evt.pageX'] - summary['min_evt.pageX'],
      rangeY = summary['max_evt.pageY'] - summary['min_evt.pageY'];

  if (evtType === 'drag' && values.length > MIN_DRAG_EVTS &&
      (rangeX > EPISILON || rangeY > EPISILON)) {

    return {
      interval: true,
      project: project(values)
    };
  }

  // Test for minimum consecutive click, shift-click pairs.
  if (evtType === 'click' && values.length > MIN_SHIFTCLICK_EVTS) {
    values = values.slice(-MIN_SHIFTCLICK_EVTS);
    for (var i = MIN_SHIFTCLICK_EVTS - 1; i >= 0; --i) {
      if (values[i].evt.shiftKey !== !!(i % 2)) {
        return {interval: false};
      }
    }

    return {
      interval: true,
      project: project(values)
    };
  }

  return {interval: false};
}

function project(values) {
  // We want to reaggregate based on just the passed in values (the most recent
  // ones) because the overall min/max pageX/pageY will be meaningless over
  // multiple demonstrations.
  var dims = dl.groupby()
    .summarize({'evt.pageX': ['min', 'max'], 'evt.pageY': ['min', 'max']})
    .execute(values);

  dims = dims[0];
  var episilon = values[0].evtType === 'click' ? EPISILON_CLICK : EPISILON,
      onlyY = dims['max_evt.pageX'] - dims['min_evt.pageX'] <= episilon,
      onlyX = dims['max_evt.pageY'] - dims['min_evt.pageY'] <= episilon;

  if (onlyX && !onlyY) {
    return {channels: ['x'], _score: DIM_SCORES.SINGLE};
  } else if (onlyY && !onlyX) {
    return {channels: ['y'], _score: DIM_SCORES.SINGLE};
  }

  return {channels: ['x', 'y'], _score: DIM_SCORES.BOTH};
}

function reset() {
  aggr.clear();
}

module.exports = {
  record: record,
  classify: classify,
  reset: reset
};
