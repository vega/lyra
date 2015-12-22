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
    primitives = {};

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

model.export = function(scene) {
  var spec = scene || model.Scene.export(true);
  
  spec.data = pipelines.reduce(function(arr, id) { 
    return (arr.push.apply(arr, lookup(id).export(true)), arr); 
  }, []);

  return spec;
};

model.manipulators = function() {
  var spec = model.export(model.Scene.manipulators()),
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
  return new Promise(function(resolve, reject) {
    vg.parse.spec(model.manipulators(), function(err, chart) {
      if (err) reject(err);
      else resolve(model.view = chart({ el: el }));
    });
  }).then(model.update);
};

model.update = function() { 
  return model.view.update(); 
};