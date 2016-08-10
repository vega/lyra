'use strict';

var ctrl = require('./'),
    sg = require('./signals'),
    store = require('../store'),
    recordEvent = require('../actions/recordingActions').recordEvent,
    getIn = require('../util/immutable-utils').getIn,
    MODES = require('../constants/modes');

// Supported events for recording.
var EVENTS = ['mousemove', 'mouseover', 'click', 'dblclick'];

var eventLog = [],
    clickLog = [],
    dragging; // idx in eventLog where dragging (mousedown) starts.

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
  clickLog = [];
  dragging = undefined;
}

function record(evt, item) {
  var entry = {
    evt: evt,
    item: item,
    dragging: dragging
  };

  eventLog.push(entry);
  if (evt.type === 'click' || evt.type === 'dblclick') {
    clickLog.push(entry);
  }

  store.dispatch(recordEvent(eventLog, clickLog));
}

function detectDrag(evt) {
  if (evt.type === 'mousedown') {
    dragging = eventLog.length;
  } else if (evt.type === 'mouseup') {
    dragging = undefined;
  }
}

module.exports = {start: start, stop: stop};
