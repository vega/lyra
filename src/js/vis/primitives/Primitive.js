var dl = require('datalib'),
    vg = require('vega'),
    sg = require('../../state/signals');

function Primitive() {
}

var prototype = Primitive.prototype;

// Primitive classes are wrappers around the corresponding Vega
// specification. Clean them up to remove Lyra-specific things.
// This also converts signalRefs -> values unless resolve === false.
function clean(spec, resolve) {
  var k, p, c, res = resolve !== false;
  for (k in spec) {
    p = spec[k];
    c = k.startsWith('_');
    c = c || p._disabled;
    if (c) {
      delete spec[k];
    } else if (dl.isObject(p)) {
      spec[k] = p.signal && res ? sg.value(p.signal) : clean(spec[k], resolve);
    }
  }

  return spec;
}

prototype.export = function(resolve) {
  return clean(dl.duplicate(this), resolve);
};

module.exports = Primitive;