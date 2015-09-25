var dl = require('datalib'),
    NS = 'lyra_',
    signals, defaults;

// Namespace Lyra state signals
function ns(name) { return name.startsWith(NS) ? name : NS+name; }

function init(name, val) {
  name = ns(name);
  if (arguments.length === 1) return signals[name];

  signals[name] = {
    name: name, 
    init: val, 
    _idx: dl.keys(signals).length 
  };
  return ref(name);
}

function ref(name) {
  return {signal: ns(name)};
}

function value(name, val) {
  var state = require('../'),
      view  = state.view,
      sg  = signals[name=ns(name)],
      set = arguments.length === 2;

  // Wrap signal accessors in a try/catch in case view doesn't exist,
  // or signal hasn't been registered yet with the view.
  try { 
    val = view.signal.apply(view, arguments); 
  } catch (e) {
    val = sg.init;
  }

  return set ? api : val;
}

// Stash current signal values from the view into our model
// to allow seamless re-renders. 
function stash() {
  var state = require('../'),
      view  = state.view;
  if (!view) return signals;

  for (var k in signals) {
    if (defaults.names.indexOf(k) >= 0) continue;
    try { signals[k].init = view.signal(k); }
    catch (e) {}
  }

  return signals;
}

function streams(name, def) {
  var sg = signals[ns(name)];
  if (arguments.length === 1) return sg.streams;
  return (sg.streams = def, api);
}

var api = module.exports = function() { return signals; };
api.ns  = ns;
api.init  = init;
api.ref   = ref;
api.value = value;
api.stash = stash;
api.streams = streams;

dl.extend(api, defaults=require('./defaults'));
signals = api.signals;
delete api.signals;
delete api.names;