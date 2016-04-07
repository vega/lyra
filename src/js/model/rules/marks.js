'use strict';
var model = require('../'),
    sg = require('../signals'),
    propSg = require('../../util/prop-signal'),
    lookup = model.lookup;

function bindProperty(map, property, props, def, from) {
  var d = def[property],
      p = (props[property] = {});

  if (typeof d.scale !== 'undefined') {
    p.scale = map.scales[d.scale];
  }
  if (typeof d.field !== 'undefined') {
    if (d.field.group) {
      p.group = d.field.group;
    } else {
      p.field = from.schema()[d.field]._id;
    }
  }
  if (typeof d.value !== 'undefined') {
    p.signal = propSg(this, property);
    sg.set(p.signal, d.value);
  }

  if (typeof d.band !== 'undefined') {
    p.band = d.band;
  }
  if (typeof d.offset !== 'undefined') {
    p.offset = d.offset;
  }
}

// Spatial properties for rect marks require more parsing before binding.
// Vega-Lite produces center/span (e.g., xc/width) properties when using
// an ordinal scale as "points": true. However, Lyra hews closer to the
// Vega representation (start/span).
var RECT_SPANS = {x: 'width', y: 'height'};
function rectSpatial(map, property, channel, props, def, from) {
  var bind = channel + '2',
      cntr = channel + 'c',
      span = RECT_SPANS[channel];

  // If we're binding to a literal spatial property (i.e., span
  // manipulators not arrows), bind only that property.
  if (property !== channel + '+') {
    def[property] = def[property] || def[channel] || def[cntr];
    return bindProperty.call(this, map, property, props, def, from);
  }

  if (def[bind]) {
    bindProperty.call(this, map, channel, props, def, from);
    bindProperty.call(this, map, bind, props, def, from);
    props[span]._disabled = true;
  } else {
    def[channel] = def[cntr]; // Map xc/yc => x/y for binding.
    bindProperty.call(this, map, channel, props, def, from);

    // Width/height should use bandWidth
    def[span] = {scale: def[channel].scale, band: true, offset: -1};
    bindProperty.call(this, map, span, props, def, from);

    props[bind]._disabled = true;
  }
}

// If we have a this.from, analyze some output VL produced for mark: map from
// the properties in VL to something in Lyra, then call either rectSpatial to
// set spatial properties, or the normal bindProperty call.
//
// (For rectangles we need to do some additional work to account for X+, Width
// and X2 properties, where VL only has X and Y)
module.exports = function(parsed, property, channel) {
  var map = this._rule._map,
      def = parsed.spec.marks[0].marks[0],
      props = this.properties.update,
      dprops = def.properties.update,
      from;

  if (def.from && def.from.data) {
    this.dataset(map.data[def.from.data]);
    from = lookup(this.from);
  }

  if (this.type === 'rect' && (channel === 'x' || channel === 'y')) {
    rectSpatial.call(this, map, property, channel, props, dprops, from);
  } else {
    bindProperty.call(this, map, property, props, dprops, from);
  }
};
