/* eslint no-undefined: 0 */
'use strict';
var dl = require('datalib'),
    vg = require('vega'),
    sg = require('./signals'),
    manips = require('./manipulators'),
    ns = require('../util/ns'),
    hierarchy = require('../util/hierarchy'),
    store = require('../store'),
    getIn = require('../util/immutable-utils').getIn,
    CancellablePromise = require('../util/simple-cancellable-promise'),
    inspectorActions = require('../actions/inspectorActions'),
    selectMark = inspectorActions.selectMark,
    expandLayers = inspectorActions.expandLayers;

/** @namespace */
var ctrl = module.exports = {
  view: null,
  Scene: null
};

var listeners = {};

Object.defineProperty(ctrl, 'Scene', {
  enumerable: true,
  get: function() {
    var state = store.getState(),
        sceneId = getIn(state, 'scene.id');

    if (sceneId) {
      return getIn(state, 'marks.' + sceneId).toJS();
    }
  }
});

function register() {
  var win = d3.select(window),
      dragover = 'dragover.altchan';

  // Register a window dragover event handler to detect shiftKey
  // presses for alternate channel manipulators.
  if (!win.on(dragover)) {
    win.on(dragover, function() {
      var mode = sg.get(sg.MODE),
          shiftKey = d3.event.shiftKey,
          prevKey = Boolean(ctrl._shiftKey);

      if (prevKey === shiftKey) {
        return;
      }
      ctrl._shiftKey = shiftKey;
      var setAltChan = mode === 'altchannels' ? 'channels' : mode;
      sg.set(sg.MODE, mode === 'channels' ? 'altchannels' : setAltChan);
      ctrl.update();
    });
  }

  ctrl.view.onSignal(sg.SELECTED, function(name, selected) {
    var def = selected.mark.def,
        id = def && def.lyra_id;

    if (getIn(store.getState(), 'inspector.encodings.selectedId') === id) {
      return;
    }

    // Walk up from the selected primitive to create an array of its parent groups' IDs
    var parentLayerIds = hierarchy.getParentGroupIds(id);

    if (id) {
      // Select the mark,
      store.dispatch(selectMark(id));
      // And expand the hierarchy so that it is visible
      store.dispatch(expandLayers(parentLayerIds));
    }
  });

  Object.keys(listeners).forEach(function(signalName) {
    listeners[signalName].forEach(function(handlerFn) {
      ctrl.view.onSignal(signalName, handlerFn);
    });
  });
}

ctrl.export = require('./export');

/**
 * Exports the ctrl as a complete Vega specification with extra definitions
 * to power Lyra-specific interaction. In particular, this includes definitions
 * of all the Lyra-specific signals and manipulators (handles, channels, etc.).
 * @returns {Object} A Vega specification.
 */
ctrl.manipulators = function() {
  var spec = ctrl.export(true),
      data = spec.data || (spec.data = []),
      signals = spec.signals || (spec.signals = []),
      marks = spec.marks || (spec.marks = []),
      idx = dl.comparator('_idx');

  // Stash signals from vega into the lyra ctrl, in preparation for seamlessly
  // destroying & recreating the vega view
  // sg() is a function that returns all registered signals
  signals.push.apply(signals, dl.vals(sg()).sort(idx));

  data.push({
    name: 'bubble_cursor',
    transform: [{type: ns('bubble_cursor')}]
  });

  marks.push(manips.BUBBLE_CURSOR);
  data.push({
    name: 'dummy_data_line',
    values: [
      {
        foo: 100,
        bar: 100
      },
      {
        foo: 200,
        bar: 200
      }
    ]
  });
  // I don't want line and area to overlap. When we have the option to drag onto the scene,
  // I would change this
  data.push({
    name: 'dummy_data_area',
    values: [
      {x: 100, y: 28},
      {x: 200, y: 55},
    ]
  });

  return spec;
};

// Local variable used to hold the last-initiated Vega ctrl reparse
var parsePromise = null;

/**
 * Parses the ctrl's `manipulators` spec and (re)renders the visualization.
 * @param  {string} [el] - A CSS selector corresponding to the DOM element
 * to render the visualization in.
 * @returns {Object} A Promise that resolves once the spec has been successfully
 * parsed and rendered.
 */
ctrl.parse = function(el) {
  el = el || '#vis';
  if (parsePromise) {
    // A parse is already in progress; cancel that parse's callbacks
    parsePromise.cancel();
  }

  // Start the newly-requested parse within a cancellable promise
  parsePromise = new CancellablePromise(function(resolve, reject) {

    // Debounce parse initiation very slightly to handle re-starts on subsequent
    // store listener digest cycles: CancellablePromise exposes its state through
    // this.cancel.
    var that = this;
    setTimeout(function() {
      if (that.cancelled) {
        return;
      }
      // Recreate the vega spec
      vg.parse.spec(ctrl.manipulators(), function(err, chart) {
        if (err) {
          return reject(err);
        }
        resolve(chart);
      });
    }, 10);
  });

  return parsePromise.then(function(chart) {
    ctrl.view = chart({
      el: el
    });
    // Register all event listeners to the new view
    register();
    // the update() method initiates visual encoding and rendering:
    // View has to update once before scene is ready
    ctrl.update();
    // Re-parse complete: null out the completed promise
    parsePromise = null;
  });
};

/**
 * Re-renders the current spec (e.g., to account for new signal values).
 * @returns {void}
 */
ctrl.update = function() {
  if (ctrl.view && ctrl.view.update && typeof ctrl.view.update === 'function') {
    ctrl.view.update();
  }
};

/**
 * Registers a signal value change handler.
 * @param  {string} name - The name of a signal.
 * @param  {Function} handler - The function to call when the value of the
 * named signal changes.
 * @returns {Object} The Lyra ctrl.
 */
ctrl.onSignal = function(name, handler) {
  listeners[name] = listeners[name] || [];
  listeners[name].push(handler);
  if (ctrl.view) {
    ctrl.view.onSignal(name, handler);
  }
  return ctrl;
};

/**
 * Unregisters a signal value change handler.
 * @param  {string} name - The name of a signal.
 * @param  {Function} handler - The function to unregister; this function
 * should have previously been registered for this signal using `onSignal`.
 * @returns {Object} The Lyra ctrl.
 */
ctrl.offSignal = function(name, handler) {
  listeners[name] = listeners[name] || [];
  var listener = listeners[name];
  for (var i = listener.length; --i >= 0;) {
    if (!handler || listener[i] === handler) {
      listener.splice(i, 1);
    }
  }
  if (ctrl.view) {
    ctrl.view.offSignal(name, handler);
  }
  return ctrl;
};


/**
 * Remove all listeners or just those for a specific mark (determined
 * by the ID and Type of the mark, which are utilized in the listener
 * key) to clean up the listener store when removing one or many marks.
 *
 * @param {Object} mark - A mark descriptor object or mark instance
 * @param {number} mark._id - A numeric mark ID
 * @param {string} mark.type - A mark type e.g. "rect"
 * @returns {void}
 */
ctrl.removeListeners = function(mark) {
  // Remove all listeners
  if (!mark) {
    listeners = {};
    return;
  }

  // Remove a specific mark's listeners
  var listenerForMarkRegex = new RegExp('^' + ns(mark.type + '_' + mark._id));
  listeners = Object.keys(listeners).reduce(function(filteredListeners, key) {
    if (!listenerForMarkRegex.test(key)) {
      filteredListeners[key] = listeners[key];
    }
    return filteredListeners;
  }, {});
};
