var NS = 'lyra_', 
    SELECTED = NS+'selected',
    MANIPULATORS = NS+'manipulators',
    signals = {};

signals[SELECTED] = {
  name: SELECTED,
  init: {mark: {}},
  streams: [
    { type: 'click[eventItem().mark && eventItem().mark.name]', 
      expr: 'eventItem()' },
    { type: 'click[!eventItem().mark]', expr: '{mark: {}}' }
  ]
};

signals[MANIPULATORS] = {
  name: MANIPULATORS, 
  init: 'handles'
};

// Namespace Lyra state signals
function ns(name) { return name.startsWith(NS) ? name : NS+name; }

function def(name, init) {
  name = ns(name);
  if (arguments.length === 1) return signals[name];
  signals[name] = {name: name, init: init};
  return ref(name);
}

function ref(name) {
  return {signal: ns(name)};
}

function value(name, val) {
  var state = require('./'),
      view  = state.view,
      sg = signals[name=ns(name)];

  // Wrap signal accessors in a try/catch in case view doesn't exist,
  // or signal hasn't been registered yet with the view.
  try { view.signal.apply(view, arguments); } 
  catch(e) {}  

  // If a val is specified, update lyra's state for subsequent re-renders.
  if (arguments.length === 2) {
    return (sg.init = val, api);
  } else {
    return sg.init;
  }
}

var api = module.exports = function() { return signals; };
api.NS = NS;
api.SELECTED = SELECTED;
api.MANIPULATORS = MANIPULATORS;
api.def = def;
api.ref = ref;
api.value = value;