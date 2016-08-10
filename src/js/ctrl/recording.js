'use strict';

var dl = require('datalib'),
    ctrl = require('./'),
    sg = require('./signals'),
    store = require('../store'),
    recordEvent = require('../actions/recordingActions').recordEvent,
    getIn = require('../util/immutable-utils').getIn,
    MODES = require('../constants/modes');

// Supported events for recording.
var EVENTS = ['mousemove', 'mouseover', 'click', 'dblclick'];

// The fields that comprise an "event signature."
// TODO: not evt.type to be able to detect/rewrite "drags."
var EVT_SIG = ['type', 'evt.altKey', 'evt.ctrlKey', 'evt.metaKey', 'evt.shiftKey'];

// We want to keep a log of streams of the following events. By streams we mean
// that all the events in the log must be of the same type. If a new logged
// event occurs, the log is first cleared of the old stream.
var LOG_EVENTS = ['click', 'dblclick', 'drag'],
    eventLog = [];

// For all events, we also calculate summary statistics by event signature.
var summary = dl.groupby(EVT_SIG)
    .summarize({'*': 'count', itemId: 'distinct'});

// Is the user performing a drag operation?
var dragging = false;

function start() {
  if (!ctrl || !ctrl.view) {
    return;
  }

  var active = getIn(store.getState(), 'recordings.active');
  if (!active) {
    return;
  }

  EVENTS.forEach(function(etype) {
    ctrl.view.on(etype, record);
  });

  sg.set(sg.MODE, MODES.RECORDING);
  ctrl.view.on('mousedown', detectDrag).on('mouseup', detectDrag)
    .update();
}

function stop() {
  if (ctrl && ctrl.view) {
    EVENTS.forEach(function(etype) {
      ctrl.view.off(etype, record);
    });

    sg.set(sg.MODE, MODES.HANDLES);
    ctrl.view.off('mousedown', detectDrag).off('mouseup', detectDrag)
      .update();
  }

  eventLog = [];
  summary.clear();
  dragging = false;
}

function record(evt, item) {
  var type = evt.vegaType;
  type = type === 'mousemove' && dragging ? 'drag' : type;

  var entry = {
    type: type,
    evt: evt,
    item: item,
    itemId: item ? item._id : null
  };

  summary.insert([entry]);
  if (LOG_EVENTS.indexOf(type) >= 0) {
    if (eventLog.length && eventLog[eventLog.length - 1].type !== type) {
      eventLog = [];
    }

    eventLog.push(entry);
  }

  store.dispatch(recordEvent(entry, summary.result(), eventLog));
}

function detectDrag(evt) {
  if (evt.type === 'mousedown') {
    dragging = true;
  } else if (evt.type === 'mouseup') {
    dragging = false;
  }
}

module.exports = {start: start, stop: stop, EVT_SIG: EVT_SIG};
