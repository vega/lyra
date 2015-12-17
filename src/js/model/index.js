var dl = require('datalib'),
    vg = require('vega'),
    sg  = require('./signals'),
    Vis = require('./primitives/Visualization'),
    manips = require('./primitives/marks/manipulators'),
    util  = require('../util');

var model = module.exports = {
  Vis:  null,
  view: null
};

model.init = function() {
  model.Vis = new Vis().init();
  model.parse();
};

model.manipulators = function() {
  var spec = model.Vis.manipulators(),
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
  })
    .then(model.update)
    .catch(function(err) { console.error(err); });
};

model.update = function() { 
  return model.view.update(); 
};

model.signal = function() {
  var ret = sg.value.apply(sg, arguments);
  return ret === sg ? model : ret;
};

model.export = function() {
  return model.Vis.export(true);
};