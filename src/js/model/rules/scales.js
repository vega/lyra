var dl = require('datalib'),
    Scale = require('../primitives/Scale'),
    rules = require('./'),
    model = require('../'),
    lookup = model.lookup;

var REF_CELLW = {'data': 'layout', 'field': 'cellWidth'},
    REF_CELLH = {'data': 'layout', 'field': 'cellHeight'};

module.exports = function(parsed) {
  var map = this._rule._map.scales,
      channels = dl.keys(parsed.rule.encoding),
      scales = parsed.spec.marks[0].scales,
      find = function(x) {
        return x.name === name;
      },
      i = 0, len = channels.length,
      name, def, curr;

  // Vega-Lite names scales by the channel they're used for.
  for (; i < len; ++i) {
    name = channels[i];
    curr = lookup(map[name]);
    def = parse.call(this, scales.find(find));
    if (!def) {
      continue;
    }
    if (!curr || !equals(def, curr)) {
      scale.call(this, def);
    }
  }
};

// Parse a Vega scale definition (produced by Vega-Lite)
// and produce a Lyra-compatible Scale object.
function parse(def) {
  if (!def) {
    return null;
  }
  var map = this._rule._map.data,
      domain = def.domain,
      range = def.rangeMin || def.rangeMax,
      data;

  if (!dl.isArray(domain)) {
    data = lookup(map[domain.data]);
    def._domain = [data.schema()[domain.field]._id];
  }

  // TODO: Use bandSize initially?
  if (def.name === 'x' || range === rules.CELLW || dl.equal(range, REF_CELLW)) {
    def.range = 'width';
  } else if (def.name === 'y' || range === rules.CELLH || dl.equal(range, REF_CELLH)) {
    def.range = 'height';
  }

  delete def.rangeMin;
  delete def.rangeMax;
  delete def.bandSize;
  return def;
}

// Vega-Lite always produces ordinal scales with points. However, Lyra
// prefers to not use point-ordinals for rect marks to simplify encoding
// specification (i.e., not exposing xc/yc and resizing groups).
function equals(def, scale) {
  var markType = this.type,
      points = def.type === 'ordinal' && markType !== 'rect';
  /* jshint -W018 */
  return scale.type === def.type && !!scale.points === points &&
    dl.equal(scale._domain, def._domain) && scale.range === def.range;
  /* jshint +W018 */
}

function scale(def) {
  var markType = this.type,
      points = def.type === 'ordinal' && markType !== 'rect',
      scales = model.scale(),
      s = scales.find(equals.bind(this, def));

  if (!s) {
    s = model.scale(new Scale(def.name, def.type, undefined, def.range));
    s._domain = def._domain;
    s.points = points;
    if (points) {
      s.padding = def.padding;
    }
  }

  s.nice = def.nice;
  s.round = def.round;

  this._rule._map.scales[def.name] = s._id;
  return this.parent().child('scales', s);
}
