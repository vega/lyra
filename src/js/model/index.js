/* eslint no-undefined: 0 */
'use strict';
var dl = require('datalib'),
    vg = require('vega'),
    debounce = require('lodash.debounce'),
    throttle = require('lodash.throttle'),
    sg = require('./signals'),
    manips = require('./primitives/marks/manipulators'),
    ns = require('../util/ns'),
    hierarchy = require('../util/hierarchy'),
    store = require('../store'),
    getIn = require('../util/immutable-utils').getIn,
    CancellablePromise = require('../util/simple-cancellable-promise'),
    selectMark = require('../actions/selectMark'),
    expandLayers = require('../actions/expandLayers'),
    reparse = require('../actions/reparse');

/** @namespace */
var model = module.exports = {
  view: null,
  Scene: null
};

var pipelines = [], scales = [],
    primitives = {},
    listeners = {};

/**
 * Initializes the Lyra model with a new Scene primitive.
 * @returns {Object} The Lyra Model
 */
model.init = function() {
  var Scene = require('./primitives/marks/Scene');
  model.Scene = new Scene().init();
  store.dispatch(expandLayers([model.Scene._id]));
  return this;
};

/**
 * @description A setter for primitives based on IDs. To prevent memory leaks,
 * primitives do not directly store references to other primitives. Instead,
 * they store IDs and use model.lookup as a lookup. When a new primitive is
 * created, it calls this function to store itself in the model.
 *
 * @param {number} id - The numeric ID of the primitive to set.
 * @param {Object} primitive - Store the provided primitive in the lyra model,
 * keyed by the given ID.
 * @returns {Object} The Lyra model.
 */
model.primitive = function(id, primitive) {
  primitives[id] = primitive;
  return model;
};

/**
 * @description A getter for primitives based on IDs. Primitives store their IDs
 * in the model and use this method as a lookup.
 *
 * @param {number} id - The numeric ID of a specific primitive to look up.
 * @returns {Object} The Lyra model.
 */
var lookup = model.lookup = function(id) {
  return primitives[id];
};

function getset(cache, id, Type) {
  if (id === undefined) {
    return cache.map(function(x) {
      return lookup(x);
    });
  } else if (dl.isNumber(id)) {
    return lookup(id);
  }
  var obj = dl.isString(id) ? new Type(id) : id;
  return (cache.push(obj._id), obj);
}


function register() {
  var win = d3.select(window),
      dragover = 'dragover.altchan';

  // Register a window dragover event handler to detect shiftKey
  // presses for alternate channel manipulators.
  if (!win.on(dragover)) {
    win.on(dragover, function() {
      var mode = sg.get(sg.MODE),
          shiftKey = d3.event.shiftKey,
          prevKey = Boolean(model._shiftKey);

      if (prevKey === shiftKey) {
        return;
      }
      model._shiftKey = shiftKey;
      var setAltChan = mode === 'altchannels' ? 'channels' : mode;
      sg.set(sg.MODE, mode === 'channels' ? 'altchannels' : setAltChan);
      model.update();
    });
  }

  model.view.onSignal(sg.SELECTED, function(name, selected) {
    var def = selected.mark.def,
        id = def && def.lyra_id;

    if (getIn(store.getState(), 'inspector.selected') === id) {
      return;
    }

    // Walk up from the selected primitive to create an array of its parent groups' IDs
    var parentLayerIds = hierarchy.getParentGroupIds(lookup(id));

    if (id) {
      // Select the mark,
      store.dispatch(selectMark(id));
      // And expand the hierarchy so that it is visible
      store.dispatch(expandLayers(parentLayerIds));
    }
  });

  Object.keys(listeners).forEach(function(signalName) {
    listeners[signalName].forEach(function(handlerFn) {
      model.view.onSignal(signalName, handlerFn);
    });
  });
}

/**
 * A getter or creator for Pipelines.
 * @param  {number|string} [id] - The numeric ID of an existing Pipeline to retrieve
 * or the name of a new Pipeline to instantiate. If no id is given, returns all
 * Pipelines.
 * @returns {Object|Object[]} A Pipeline or array of Pipelines.
 */
model.pipeline = function(id) {
  return getset(pipelines, id, require('./primitives/data/Pipeline'));
};

/**
 * A getter or creator for Scales.
 * @param  {number|string} [id] - The numeric ID of an existing Scale to retrieve
 * or the name of a new Scale to instantiate. If no id is given, returns all
 * Scales.
 * @returns {Object|Object[]} A Scale or array of Scales.
 */
model.scale = function(id) {
  return getset(scales, id, require('./primitives/Scale'));
};

/**
 * Exports the model as a complete Vega specification.
 * @param  {Object}  [scene] - An exported specification of the Scene.
 * @param  {boolean} [clean=true] - Should Lyra-specific properties be removed
 * or resolved (e.g., converting property signal references to actual values).
 * @returns {Object} A Vega specification.
 */
model.export = function(scene, clean) {
  clean = clean || clean === undefined;
  var spec = scene || model.Scene.export(clean);

  spec.data = pipelines.reduce(function(arr, id) {
    return (arr.push.apply(arr, lookup(id).export(clean)), arr);
  }, []);

  return spec;
};

/**
 * Exports the model as a complete Vega specification with extra definitions
 * to power Lyra-specific interaction. In particular, this includes definitions
 * of all the Lyra-specific signals and manipulators (handles, channels, etc.).
 * @returns {Object} A Vega specification.
 */
model.manipulators = function() {
  var spec = model.export(model.Scene.manipulators(), false),
      data = spec.data || (spec.data = []),
      signals = spec.signals || (spec.signals = []),
      predicates = spec.predicates || (spec.predicates = []),
      marks = spec.marks || (spec.marks = []),
      idx = dl.comparator('_idx');

  // Stash signals from vega into the lyra model, in preparation for seamlessly
  // destroying & recreating the vega view
  // sg() is a function that returns all registered signals
  signals.push.apply(signals, dl.vals(sg()).sort(idx));

  predicates.push({
    name: sg.CELL,
    type: '==',
    operands: [{signal: sg.CELL + '.key'}, {arg: 'key'}]
  });

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

var parsePromise = null;
/**
 * Parses the model's `manipulators` spec and (re)renders the visualization.
 * @param  {string} [el] - A CSS selector corresponding to the DOM element
 * to render the visualization in.
 * @returns {Object} A Promise that resolves once the spec has been successfully
 * parsed and rendered.
 */
model.parse = function(el) {
  el = el || '#vis';
  if (parsePromise) {
    console.log('cancelling in-flight reparse');
    // A parse is already in progress; cancel that parse's callbacks
    parsePromise.cancel();
  }

  // Start the newly-requested parse within a cancellable promise
  console.log('starting new reparse');
  if (model.view) {
    // Clear out the outdated vega spec
    model.view.destroy();
  }
  vg.dataflow.Tuple.reset();
  parsePromise = new CancellablePromise(function(resolve, reject) {

    // Recreate the vega spec
    vg.parse.spec(model.manipulators(), function(err, chart) {
      if (err) {
        return reject(err);
      }
      model.view = chart({
        el: el
      });
      register();
      resolve(model.view);
    });
  });

  return parsePromise.then(function(view) {
    // model.view = view;
    // Register all event listeners to the new view
    register();
    // the update() method initiates visual encoding and rendering
    view.update();
    // Re-parse complete: null out the completed promise
    parsePromise = null;
  });
};

/**
 * Re-renders the current spec (e.g., to account for new signal values).
 * @returns {void}
 */
model.update = function() {
  if (model.view && model.view.update && typeof model.view.update === 'function') {
    model.view.update();
  }
};

/**
 * Registers a signal value change handler.
 * @param  {string} name - The name of a signal.
 * @param  {Function} handler - The function to call when the value of the
 * named signal changes.
 * @returns {Object} The Lyra model.
 */
model.onSignal = function(name, handler) {
  listeners[name] = listeners[name] || [];
  listeners[name].push(handler);
  if (model.view) {
    model.view.onSignal(name, handler);
  }
  return model;
};

/**
 * Unregisters a signal value change handler.
 * @param  {string} name - The name of a signal.
 * @param  {Function} handler - The function to unregister; this function
 * should have previously been registered for this signal using `onSignal`.
 * @returns {Object} The Lyra model.
 */
model.offSignal = function(name, handler) {
  listeners[name] = listeners[name] || [];
  var listener = listeners[name];
  for (var i = listener.length; --i >= 0;) {
    if (!handler || listener[i] === handler) {
      listener.splice(i, 1);
    }
  }
  if (model.view) {
    model.view.offSignal(name, handler);
  }
  return model;
};

/**
 * When vega re-renders we use the stored ID of the selected mark to re-select
 * that mark in the new vega instance
 * @returns {void}
 */
function updateSelectedMarkInVega() {
  var storeSelectedId = getIn(store.getState(), 'inspector.selected');
  // If no item is marked selected in the store, or if the view is not ready,
  // take no action
  if (!storeSelectedId || !model.view || !model.view.model || !model.view.model().scene()) {
    return;
  }
  var def = sg.get(sg.SELECTED).mark.def,
      vegaSelectedId = def && def.lyra_id;

  // If the store and the Vega scene graph are in sync, take no action
  if (storeSelectedId === vegaSelectedId) {
    return;
  }

  var selectedMark = lookup(storeSelectedId),
      // Walk up from the selected primitive to find all parent groups and create
      // an array of all relevant [lyra] IDs
      markIds = [storeSelectedId].concat(hierarchy.getParentGroupIds(selectedMark)),
      // then walk down the rendered Vega scene graph to find a corresponding item.
      item = hierarchy.findInItemTree(model.view.model().scene().items[0], markIds);

  // If an item was found, set the Lyra mode signal so that the handles appear.
  if (item !== null) {
    sg.set(sg.SELECTED, item);
  }
}

/**
 * Setting the same value on a signal twice should have no effect, so  we
 * naively set all signals on each store update to ensure store and Vega
 * stay in sync. Altering this to be smarter is one area to investigate should
 * any performance issues crop up later on, but signal writes are pretty fast.
 * @returns {void}
 */
function updateAllSignals() {
  // Nothing to do here if the view is not ready
  if (!model.view || typeof model.view.signal !== 'function') {
    return;
  }
  if (getIn(store.getState(), 'reparse')) {
    // Do not update signals if a reparse is in progress
    return;
  }
  var signals = getIn(store.getState(), 'signals');
  signals.forEach(function(value, name) {
    // Skip any signal from the defaults
    if (sg.isDefault(name)) {
      return;
    }
    // Persist any signals from the store to the view: wrap this in a try/catch
    // to handle situations where the update fires while we are registering
    // signals for new marks before a reparse has actually injected those marks
    // into the vega view itself.
    try {
      model.view.signal(name, value.init);
    } catch (e) { /* This is ok */ }
  });
}

store.subscribe(debounce(function() {
  var shouldReparse = getIn(store.getState(), 'reparse');
  console.log('should reparse?', shouldReparse);
  if (shouldReparse) {
    model.parse().then(function() {
      store.dispatch(reparse(false));
      // View has to update once before scene is ready
      // model.update();
    });
  }
}, 16));
store.subscribe(updateSelectedMarkInVega);
store.subscribe(updateAllSignals);
store.subscribe(model.update);

window.store = store;
