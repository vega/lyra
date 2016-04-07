/* eslint no-undefined:0 */
'use strict';
var dl = require('datalib'),
    Scale = require('../primitives/Scale'),
    rules = require('./'),
    model = require('../'),
    lookup = model.lookup;

var REF_CELLW = {data: 'layout', field: 'cellWidth'},
    REF_CELLH = {data: 'layout', field: 'cellHeight'};

// Parse a Vega scale definition (produced by Vega-Lite)
// and produce a Lyra-compatible Scale object.
//
// This works around VL idiosyncracies: domain or range may be hard-coded, use
// lyra primitive IDs instead e.g., in the vega output VL produces, you have
// scales, each scale has an object, that object has a name, type, and domain,
// with a range; we want to parse the domain to correspond to our lyra primitives.
//
// Map from VL -> Vega -> Lyra
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
function equals(def, s) {
  var markType = this.type,
      points = def.type === 'ordinal' && markType !== 'rect';

  /* jshint -W018 */
  return s.type === def.type && !!s.points === points &&
    dl.equal(s._domain, def._domain) && s.range === def.range;

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

  // hacky fix: rerender ui ---------------------
  var Sidebars = require('../../components');
  Sidebars.forceUpdate();
  // --------------------------------------------

  return this.parent().child('scales', s);
}

/**
 * Find or produce a lyra scale object for the channel that we just dropped
 */
module.exports = function(parsed) {
  var map = this._rule._map.scales,
      // Figure out defined channels
      channels = dl.keys(parsed.rule.encoding),
      scales = parsed.spec.marks[0].scales,
      name,
      find = function(x) {
        return x.name === name;
      },
      len = channels.length,
      def,
      curr;

  // Vega-Lite names scales by the channel they're used for.
  for (var i = 0; i < len; ++i) {
    // See if the channel exists in the mapping we've built
    name = channels[i];
    curr = lookup(map[name]);
    // This uses the map to start to construct a lyra scale
    def = parse.call(this, scales.find(find));
    if (!def) {
      continue;
    }
    if (!curr || !equals.call(this, def, curr)) {
      // If we find something, pass it off to scale to make a Lyra scale and
      // add it to our primitive registry
      scale.call(this, def);
    }
  }
};
