require('es6-promise').polyfill();

var d3 = require('d3'),
    vg = require('vega'),
    Vis = new (require('../vis/Visualization'))(),
    state = null;

function spec() {
  var s = Vis.manipulators(),
      signals = s.signals || (s.signals = []);

  signals.push.apply(signals, [
    {
      name: 'lyra.selected',
      init: {mark: {}},
      streams: [
        {type: 'click[eventItem().mark && eventItem().mark.name]', 
          expr: 'eventItem()'},
        {
          type: 'click[!eventItem().mark]', 
          expr: '{mark: {}}'
        }
      ]
    },
    {name: 'lyra.manipulators', init: 'handles'}
  ]);

  return s;
}

function render() {
  vg.parse.spec(spec(), function(chart) {
    state.view = chart({ el: '#vis' }).update();
  });
}

module.exports = (state = {
  Vis: Vis,
  render: render,

  schema: require('./schema'),
  manipulators: require('./manipulators')
});