'use strict';
import * as d3 from 'd3';
import {undo, redo} from '../actions/historyActions';
import {store} from '../store';
import {selectMark} from '../actions/inspectorActions';
import {deleteMark} from '../actions/markActions';

const hierarchy = require('../util/hierarchy'),
  ACTIONS = require('../actions/Names'),
  ctrl = require('./'),
  sg = require('./signals');

const listeners = {};

module.exports = {
  onSignal: onSignal,
  offSignal: offSignal,
  register: registerSignalListeners
};

d3.select(window)
  .on('keydown', function() {
    const evt = d3.event;
    handleHistory(evt);
    handleDelete(evt);
  })
  .on('beforeunload', beforeUnload);

/**
 * Registers a signal value change handler.
 * @param  {string} name - The name of a signal.
 * @param  {Function} handler - The function to call when the value of the
 * named signal changes.
 * @returns {Object} The Lyra ctrl.
 */
export function onSignal(name, handler) {
  listeners[name] = listeners[name] || [];
  listeners[name].push(handler);
  if (ctrl.view) {
    ctrl.view.addSignalListener(name, handler);
  }
  return ctrl;
}

/**
 * Unregisters a signal value change handler.
 * @param  {string} name - The name of a signal.
 * @param  {Function} handler - The function to unregister; this function
 * should have previously been registered for this signal using `onSignal`.
 * @returns {Object} The Lyra ctrl.
 */
export function offSignal(name, handler) {
  listeners[name] = listeners[name] || [];
  const listener = listeners[name];
  for (let i = listener.length; --i >= 0; ) {
    if (!handler || listener[i] === handler) {
      listener.splice(i, 1);
    }
  }
  if (ctrl.view) {
    ctrl.view.removeSignalListener(name, handler);
  }
  return ctrl;
}

/**
 * Registers default signal listeners to coordinate altChannel manipulators and
 * to ensure clicking a mark selects its within redux. Any cached listeners
 * (e.g., by property inspectors) are re-registered after re-parses.
 * @returns {void}
 */
export function registerSignalListeners() {
  const win = d3.select(window),
    dragover = 'dragover.altchan';

  // Register a window dragover event handler to detect shiftKey
  // presses for alternate channel manipulators.
  if (!win.on(dragover)) {
    win.on(dragover, function() {
      const mode = sg.get(sg.MODE),
        shiftKey = d3.event.shiftKey,
        channels = mode === 'channels',
        altchannels = mode === 'altchannels';

      if (!channels && !altchannels) {
        return;
      }

      if (channels && shiftKey) {
        sg.set(sg.MODE, 'altchannels');
        ctrl.update();
      } else if (altchannels && !shiftKey) {
        sg.set(sg.MODE, 'channels');
        ctrl.update();
      }
    });
  }

  // TODO(rn): add this back in when handles are necessary
  // ctrl.view.addSignalListener(sg.SELECTED, function(name, selected) {
  //   var def = selected.mark.def,
  //       id = def && def.lyra_id;

  //   if (getIn(store.getState(), 'inspector.encodings.selectedId') === id) {
  //     return;
  //   }

  //   // Walk up from the selected primitive to create an array of its parent groups' IDs
  //   var parentLayerIds = hierarchy.getParentGroupIds(id);

  //   if (id) {
  //     // Select the mark,
  //     store.dispatch(selectMark(id));
  //     // And expand the hierarchy so that it is visible
  //     store.dispatch(expandLayers(parentLayerIds));
  //   }
  // });

  // Object.keys(listeners).forEach(function(signalName) {
  //   listeners[signalName].forEach(function(handlerFn) {
  //     ctrl.view.addSignalListener(signalName, handlerFn);
  //   });
  // });
}

/**
 * Returns true if the keypresses occured within an input/textarea/contenteditable,
 * in which case, we want the default functionality to kick in, not our custom.
 * @param   {Event}   evt The triggering DOM event.
 * @returns {boolean} True/false if default behaviour should/should not occur.
 */
function testInput(evt): Boolean {
  const target = evt.srcElement || evt.target,
    tagName = target.tagName.toUpperCase();

  if (tagName === 'INPUT' || tagName === 'TEXTAREA' || target.contentEditable === 'true') {
    return !target.readOnly && !target.disabled;
  }

  return false;
}

/**
 * Handles keyboard shortcuts for undo/redo
 * @param   {Event}   evt The triggering DOM event.
 * @returns {boolean} False, to prevent default behaviours.
 */
function handleHistory(evt): Boolean {
  const keyCode = evt.keyCode;

  if ((!testInput(evt) && evt.metaKey === true) || evt.ctrlKey === true) {
    // Command or Ctrl
    if (keyCode === 89) {
      // Y
      store.dispatch(redo());
      evt.preventDefault();
      return false;
    } else if (keyCode === 90) {
      // Z
      // special case (CMD-SHIFT-Z) does a redo on a mac
      store.dispatch(evt.shiftKey ? redo() : undo());
      evt.preventDefault();
      return false;
    }
  }
}

/**
 * Handles keyboard shortcut to delete the selected mark by pressing delete/backspace.
 * @param   {Event}   evt The triggering DOM event.
 * @returns {boolean} False, to prevent default behaviours.
 */
function handleDelete(evt): Boolean {
  if (!testInput(evt) && evt.keyCode === 8) {
    // Delete/Backspace
    const state = store.getState(),
      inspectors = state.getIn(['inspector', 'encodings']),
      type = inspectors.get('selectedType'),
      id = inspectors.get('selectedId'),
      groupId = state.getIn(['vis', 'present', 'marks', String(id), '_parent']);

    if (type === ACTIONS.SELECT_MARK) {
      evt.preventDefault();
      store.dispatch(selectMark(groupId) as any); //TODO(jzong) make sure it's dispatching these two thunk actions correctly
      store.dispatch(deleteMark(id) as any);
      return false;
    }
  }
}

/**
 * When built for production mode, throws a prompt to prevent unwanted
 * navigation away from Lyra.
 * @returns {string} Error message to prevent unwanted navigation away in Webkit.
 */
function beforeUnload(): string {
  if (process.env.NODE_ENV === 'production') {
    var msg = 'You have unsaved changed in Lyra.';
    d3.event.returnValue = msg; // Gecko + IE
    return msg; // Webkit, Safari, Chrome etc.
  }
}
