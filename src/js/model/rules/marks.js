var dl = require('datalib'),
    util   = require('../../util'),
    model  = require('../'),
    lookup = model.primitive;

module.exports = function(parsed, property, channel) {
  var map = this._rule._map,
      def = parsed.spec.marks[0].marks[0],
      props  = this.properties.update,
      dprops = def.properties.update,
      from;

  if (def.from && def.from.data) {
    this.pipeline(map.data[def.from.data]);
    from = lookup(this.from);
  }

  if (this.type === 'rect' && (channel === 'x' || channel === 'y')) {
    rectSpatial.call(this, map, property, channel, props, dprops, from);
  } else {
    bindProperty.call(this, map, property, props, dprops, from);
  }
};

function bindProperty(map, property, props, def, from) {
  var d = def[property],
      p = (props[property] = {});

  if (d.scale !== undefined) p.scale = map.scales[d.scale];
  if (d.field !== undefined) {
    if (d.field.group) {
      p.group = d.field.group;
    } else {
      p.field = from.schema()[d.field]._id;
    }
  }
  if (d.value !== undefined) {
    model.signal(p.signal=util.propSg(this, property), d.value);
  }

  if (d.band !== undefined)   p.band   = d.band;
  if (d.offset !== undefined) p.offset = d.offset;
}

// Spatial properties for rect marks require more parsing before binding.
// Vega-Lite produces center/span (e.g., xc/width) properties when using
// an ordinal scale as "points": true. However, Lyra hews closer to the
// Vega representation (start/span). 
var RECT_SPANS = {x: 'width', y: 'height'};
function rectSpatial(map, property, channel, props, def, from) {
  var bind = channel+'2',
      cntr = channel+'c',
      span = RECT_SPANS[channel];

  // If we're binding to a literal spatial property (i.e., span
  // manipulators not arrows), bind only that property.
  if (property !== channel+'+') {
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