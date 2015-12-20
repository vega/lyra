var util   = require('../../util'),
    model  = require('../'),
    lookup = model.primitive;

module.exports = function(parsed, property, channel) {
  var map = this._rule._map,
      def = parse.spec.marks[0].marks[0],
      props  = this.properties.update,
      dprops = def.properties.update,
      from;

  if (def.from && def.from.data) {
    this.from = map.data[def.from.data];
    from = lookup(this.from);
  }

  if (this.type === 'rect' && channel === 'x' || channel === 'y') {
    rectSpatial(map, property, channel, props, dprops, from);
  } else {
    bindProperty(map, property, props, dprops, from);
  }
};

function bindProperty(map, property, props, def, from) {
  var d = def[property],
      p = (props[property] = {}),
      sg;

  if (d.scale) p.scale = map.scales[d.scale];
  if (d.field) p.field = from.schema()[d.field]._id;
  if (d.value) {
    model.signal(sg=util.propSg(this, property), d.value);
    p.signal = {signal: sg};
  }

  p.offset = d.offset;
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

  if (def[bind]) {
    bindProperty(map, channel, props, def, from);
    bindProperty(map, bind, props, def, from);
  } else {
    def[channel] = def[cntr]; // Map xc/yc => x/y for binding.
    bindProperty(map, channel, props, def, from);

    // Width/height should use bandWidth
    def[span] = {scale: def[channel].scale, band: true, offset: -1};
    bindProperty(map, span, props, def, from);
  }
}