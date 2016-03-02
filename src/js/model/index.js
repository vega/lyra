var dl = require('datalib'),
    vg = require('vega'),
    sg = require('./signals'),
    manips = require('./primitives/marks/manipulators'),
    util = require('../util');

/** @namespace */
var model = module.exports = {
  view:  null,
  Scene: null
};

var pipelines = [], scales = [],
    primitives = {},
    listeners = {};

/**
 * Initializes the Lyra model with a new Scene primitive.
 * @return {Object}
 */
model.init = function() {
  var Scene = require('./primitives/marks/Scene');
  model.Scene = new Scene().init();
  return this;
};

/**
 * A getter and setter for primitives based on IDs. To prevent memory leaks,
 * primitives do not directly store references to other primitives. Instead,
 * they store IDs and use this method as a lookup. When a new primitive is
 * created, it calls this function to store itself in the model.
 * @param  {number} id - The numeric ID of a specific primitives.
 * @param  {Object} [primitive] - If specified, stores this primitive with
 * the given ID in the Lyra model.
 * @return {Object} The Lyra model.
 */
var lookup = model.primitive = function(id, primitive) {
  if (arguments.length === 1) {
    return primitives[id];
  }
  return (primitives[id] = primitive, model);
};

function getset(cache, id, type) {
  if (id === undefined) {
    return cache.map(function(x) { return lookup(x); });
  }
  else if (dl.isNumber(id)){
    return lookup(id);
  }
  var obj = dl.isString(id) ? new type(id) : id;
  return (cache.push(obj._id), obj);
}

/**
 * A getter or creator for Pipelines.
 * @param  {number|string} [id] - The numeric ID of an existing Pipeline to retrieve
 * or the name of a new Pipeline to instantiate. If no id is given, returns all
 * Pipelines.
 * @return {Object|Object[]} A Pipeline or array of Pipelines.
 */
model.pipeline = function(id) {
  return getset(pipelines, id, require('./primitives/data/Pipeline'));
};

/**
 * A getter or creator for Scales.
 * @param  {number|string} [id] - The numeric ID of an existing Scale to retrieve
 * or the name of a new Scale to instantiate. If no id is given, returns all
 * Scales.
 * @return {Object|Object[]} A Scale or array of Scales.
 */
model.scale = function(id) {
  return getset(scales, id, require('./primitives/Scale'));
};

/**
 * Gets or sets the value of a signal both within the model and with the parsed
 * Vega view (if available).
 * @param  {string} name - The name of a signal.
 * @param  {*} [value] The signal value to be set.
 * @return {*} The signal value if called as a getter, the model if called as
 * a setter.
 */
model.signal = function() {
  var ret = sg.value.apply(sg, arguments);
  return ret === sg ? model : ret;
};

/**
 * Exports the model as a complete Vega specification.
 * @param  {Object}  [scene] - An exported specification of the Scene.
 * @param  {boolean} [clean=true] - Should Lyra-specific definitions be removed
 * or resolved (e.g., converting property signal references to actual values).
 * @return {Object} A Vega specification.
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
 * @return {Object} A Vega specification.
 */
model.manipulators = function() {
  var spec = model.export(model.Scene.manipulators(), false),
      data = spec.data || (spec.data = []),
      signals = spec.signals || (spec.signals = []),
      predicates = spec.predicates || (spec.predicates = []),
      marks = spec.marks || (spec.marks = []),
      idx = dl.comparator('_idx');

  signals.push.apply(signals, dl.vals(sg.stash()).sort(idx));
  predicates.push({
    name: sg.CELL,
    type: '==',
    operands: [{signal: sg.CELL + '.key'}, {arg: 'key'}]
  });

  data.push({
    name: 'dropzone',
    transform: [{type: util.ns('dropzone')}]
  });

  marks.push(manips.DROPZONE);

  return spec;
};

/**
 * Parses the model's `manipulators` spec and renders the visualization.
 * @param  {string} [el] - A CSS selector corresponding to the DOM element
 * to render the visualization in.
 * @return {Object} A Promise that resolves once the spec has been successfully
 * parsed and rendered.
 */
model.parse = function(el) {
  el = (el === undefined) ? '#vis' : el;
  if (model.view) {
    model.view.destroy();
  }
  return new Promise(function(resolve, reject) {
    vg.dataflow.Tuple.reset();
    vg.parse.spec(model.manipulators(), function(err, chart) {
      if (err) {
        reject(err);
      }
      else {
        model.view = chart({el: el});
        register();
        resolve(model.view);
      }
    });
  }).then(model.update);
};

/**
 * Re-renders the current spec (e.g., to account for new signal values).
 * @return {Object} The Lyra model.
 */
model.update = function() {
  return (model.view.update(), model);
};

/**
 * Registers a signal value change handler.
 * @param  {string} name - The name of a signal.
 * @param  {Function} handler - The function to call when the value of the
 * named signal changes.
 * @return {Object} The Lyra model.
 */
model.onSignal = function(name, handler) {
  var listener = listeners[name] || (listeners[name] = []);
  listener.push(handler);
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
 * @return {Object} The Lyra model.
 */
model.offSignal = function(name, handler) {
  var listener = listeners[name] || (listeners[name] = []);
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

function register() {
  var components = require('../components'),
      win = d3.select(window),
      dragover = 'dragover.altchan',
      signalName, handlers, i, len;

  // Register a window dragover event handler to detect shiftKey
  // presses for alternate channel manipulators.
  if (!win.on(dragover)) {
    win.on(dragover, function() {
      var mode = model.signal(sg.MODE),
          shiftKey = d3.event.shiftKey,
          prevKey = !!model._shiftKey;

      if (prevKey === shiftKey) {
        return;
      }
      model._shiftKey = shiftKey;

      model.signal(sg.MODE,
          mode === 'channels' ? 'altchannels' :
            mode === 'altchannels' ? 'channels' : m).update();
    });
  }

  model.view.onSignal(sg.SELECTED, function(name, selected) {
    var def = selected.mark.def,
        id = def && def.lyra_id;
    if (id) {
      components.select(id, false);
    }
  });

  for (signalName in listeners) {
    handlers = listeners[signalName];
    for (i = 0, len = handlers.length; i < len; ++i) {
      model.view.onSignal(signalName, handlers[i]);
    }
  }
}
