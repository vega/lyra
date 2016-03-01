var dl = require('datalib'),
    util = require('../../util'),
    ns = util.ns,
    signals, defaults;

function init(name, val) {
  signals[name = ns(name)] = {
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
  var model = require('../'),
      view = model.view,
      sg = signals[name = ns(name)],
      set = arguments.length === 2;

  // Wrap signal accessors in a try/catch in case view doesn't exist,
  // or signal hasn't been registered yet with the view.
  try {
    val = view.signal.apply(view, arguments);
    return set ? api : val;
  } catch (e) {
    return set ? (sg.init = val, api) : sg.init;
  }
}

// Stash current signal values from the view into our model
// to allow seamless re-renders.
function stash() {
  var model = require('../'),
      view = model.view;
  if (!view) {
    return signals;
  }

  for (var k in signals) {
    if (defaults.names.indexOf(k) >= 0) {
      continue;
    }
    try { signals[k].init = view.signal(k); }
    catch (e) {}
  }

  return signals;
}

function streams(name, def) {
  var sg = signals[ns(name)];
  if (arguments.length === 1) {
    return sg.streams;
  }
  return (sg.streams = def, api);
}

var api = module.exports = function() { return signals; };
api.init = init;
api.ref = ref;
api.value = value;
api.stash = stash;
api.streams = streams;

dl.extend(api, defaults = require('./defaults'));
signals = api.signals;
delete api.signals;
delete api.names;
