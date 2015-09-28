var dl = require('datalib'),
    vg = require('vega'),
    sg  = require('./signals'),
    Vis = require('../vis/Visualization'),
    manips = require('../vis/primitives/marks/manipulators'),
    state = null;

function init() {
  state.Vis = new Vis()
    .init();
  parse();
}

function manipulators() {
  var spec = state.Vis.manipulators(),
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
    transform: [{type: sg.ns('dropzone')}]
  });

  marks.push(manips.DROPZONE);

  return spec;
}

function parse(el) {
  el = (el === undefined) ? '#vis' : el;
  return new Promise(function(resolve, reject) {
    vg.parse.spec(manipulators(), function(chart) {
      state.view = chart({ el: el }).update();
      resolve('Parsed!');
    });
  });
}

function update() {
  state.view.update();
}

module.exports = (state = {
  Vis:  null,
  view: null,

  signals: sg,
  signal: function() {
    var ret = sg.value.apply(sg, arguments);
    return ret === sg ? state : ret;
  },

  init:   init,
  parse:  parse,
  update: update,

  schema: require('./schema')
});