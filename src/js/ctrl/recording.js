'use strict';

var dl = require('datalib'),
    ctrl = require('./'),
    sg = require('./signals'),
    store = require('../store'),
    classes = require('../reducers/recordings/registry'),
    recordEvent = require('../actions/recordingActions').recordEvent,
    getIn = require('../util/immutable-utils').getIn,
    MODES = require('../constants/modes');

// Supported events for recording.
var EVENTS = ['mousemove', 'mouseover', 'click', 'dblclick'];

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

  dragging = false;
  dl.vals(classes).forEach(function(c) {
    c.reset();
  });
}

function record(evt, item) {
  var type = evt.vegaType,
      markId = item ? item.mark.def.lyra_id :
        getIn(store.getState(), 'inspectors.encodings.selectedId');

  type = type === 'mousemove' && dragging ? 'drag' : type;

  var action = recordEvent(type, evt, item, markId);
  dl.vals(classes).forEach(function(c) {
    c.record(action);
  });

  store.dispatch(action);
}

function detectDrag(evt) {
  if (evt.type === 'mousedown') {
    dragging = true;
  } else if (evt.type === 'mouseup') {
    dragging = false;
  }
}

module.exports = {start: start, stop: stop};
