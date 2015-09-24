var dl = require('datalib'),
    vg = require('vega')

function Primitive() {
}

var prototype = Primitive.prototype;

// Primitive classes are wrappers around the corresponding Vega
// specification. Clean them up to remove Lyra-specific things.
function clean(spec) {
  var k, p, c;
  for (k in spec) {
    p = spec[k];
    c = k.startsWith('_');
    c = c || p._disabled;
    if (c) {
      delete spec[k];
    } else if (dl.isObject(p)) {
      spec[k] = clean(spec[k]);
    }
  }

  return spec;
}

prototype.export = function() {
  return clean(dl.duplicate(this));
};

module.exports = Primitive;