var dl = require('datalib'),
    vg = require('vega'),
    sg  = require('./signals'),
    manips = require('./primitives/marks/manipulators'),
    util  = require('../util');

var model = module.exports = {
  view:  null,
  Scene: null
};

var pipelines = [], scales = [],
    primitives = {}, 
    listeners  = {};

model.init = function() {
  var Scene = require('./primitives/marks/Scene');
  model.Scene = new Scene().init();
  return this;
};

// To prevent memory leaks, primitives do not directly reference other
// primitives. Instead, they lookup against the primitives hash.
var lookup = model.primitive = function(id, primitive) {
  if (arguments.length === 1) return primitives[id];
  return (primitives[id] = primitive, model);
};

function getset(cache, id, type) {
  if (id === undefined) return cache.map(function(x) { return lookup(x); });
  else if (dl.isNumber(id)) return lookup(id);
  var obj = dl.isString(id) ? new type(id) : id;
  return (cache.push(obj._id), obj);
}

model.pipeline = function(id) {
  return getset(pipelines, id, require('./primitives/data/Pipeline'));
};

model.scale = function(id) {
  return getset(scales, id, require('./primitives/Scale'));
};

model.signal = function() {
  var ret = sg.value.apply(sg, arguments);
  return ret === sg ? model : ret;
};

model.export = function(scene, resolve) {
  resolve  = resolve || resolve === undefined;
  var spec = scene || model.Scene.export(resolve);
  
  spec.data = pipelines.reduce(function(arr, id) { 
    return (arr.push.apply(arr, lookup(id).export(resolve)), arr); 
  }, []);

  return spec;
};

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
    operands: [{signal: sg.CELL+'.key'}, {arg: 'key'}]
  });

  data.push({
    name: 'dropzone',
    transform: [{type: util.ns('dropzone')}]
  });

  marks.push(manips.DROPZONE);

  return spec;
};

model.parse = function(el) {
  el = (el === undefined) ? '#vis' : el;
  if (model.view) model.view.destroy();
  return new Promise(function(resolve, reject) {
    vg.dataflow.Tuple.reset();
    vg.parse.spec(model.manipulators(), function(err, chart) {
      if (err) {
        reject(err);
      } else {
        model.view = chart({ el: el });
        register();
        resolve(model.view);
      }
    });
  }).then(model.update);
};

model.update = function() { 
  return model.view.update(); 
};

model.onSignal = function(name, handler) {
  var listener = listeners[name] || (listeners[name] = []);
  listener.push(handler);
  if (model.view) model.view.onSignal(name, handler);
};

model.offSignal = function(name, handler) {
  var listener = listeners[name] || (listeners[name] = []);
  for (var i=listener.length; --i>=0;) {
    if (!handler || listener[i] === handler) {
      listener.splice(i, 1);
    }
  }
  if (model.view) model.view.offSignal(name, handler);
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
          prevKey  = !!model._shiftKey;
      
      if (prevKey === shiftKey) return;
      model._shiftKey = shiftKey;

      model.signal(sg.MODE,
          mode === 'channels' ? 'altchannels' :
            mode === 'altchannels' ? 'channels' : m).update();
    });
  }

  model.view.onSignal(sg.SELECTED, function(name, selected) {
    var def = selected.mark.def,
        id  = def && def.lyra_id;
    if (id) components.select(id, false);
  });

  for (signalName in listeners) {
    handlers = listeners[signalName];
    for (i=0, len=handlers.length; i<len; ++i) {
      model.view.onSignal(signalName, handlers[i]);
    }
  }
}