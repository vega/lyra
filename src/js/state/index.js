var dl = require('datalib'),
    vg = require('vega'),
    Vis = require('../vis/Visualization'),
    sg  = require('./signals'),
    state = null;

function init() {
  state.Vis = new Vis()
    .init();
  parse();
}

function spec() {
  var s = state.Vis.manipulators(),
      signals = s.signals || (s.signals = []);
  signals.push.apply(signals, dl.vals(sg()));
  return s;
}

function parse() {
  vg.parse.spec(spec(), function(chart) {
    state.view = chart({ el: '#vis' }).update();
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