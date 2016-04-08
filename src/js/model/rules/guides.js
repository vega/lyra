'use strict';
var dl = require('datalib'),
    Guide = require('../primitives/Guide'),
    model = require('../'),
    lookup = model.lookup;

var TYPES = Guide.TYPES,
    CTYPE = {
      x: TYPES.AXIS, y: TYPES.AXIS,
      color: TYPES.LEGEND, size: TYPES.LEGEND, shape: TYPES.LEGEND
    };

/**
 * Parses definitions for guides (axes and legends) in the resultant Vega
 * specification to determine if new Lyra Guide primitives should be
 * constructed, or existing ones updated.
 *
 * @namespace rules.guides
 * @memberOf rules
 * @param  {Object} parsed   An object containing the parsed rule and output Vega spec.
 * @param  {string} property The Lyra mark's property that was just bound.
 * @param  {string} channel  The corresponding Vega-Lite channel
 * @return {void}
 */
function guides(parsed, property, channel) {
  var ctype = CTYPE[channel];
  if (!ctype) return;

  var group = parsed.spec.marks[0],
      props = this.properties.update,
      prop = props[property] || props[channel],
      scale = prop.scale && lookup(prop.scale);
  if (!scale) return;

  return ctype === TYPES.AXIS ?
    axis.call(this, scale, group.axes) :
    legend.call(this, scale, group.legends, property);
}

var SWAP_ORIENT = {
  left: 'right', right: 'left',
  top: 'bottom', bottom: 'top'
};

/**
 * Attempts to find an axis for the given scale. If one is not found, and the
 * enclosing group does not already have two axes of the same type (i.e., two
 * x-axes or two y-axes), a new Lyra axis Guide primitive is constructed.
 *
 * @memberOf rules.guides
 * @param  {Scale}  scale A Lyra Scale primitive.
 * @param  {Object} defs  A parsed Vega axis definition.
 * @return {void}
 */
function axis(scale, defs) {
  var map = this._rule._map.scales,
      axes = this.parent().axes,
      def = defs.find(function(d) {
        return map[d.scale] === scale._id;
      }),
      axis, count = 0;

  axes.forEach(function(a) {
    a = lookup(a);
    if (a.type === def.type) {
      ++count;
    }
    if (a.scale === scale._id) {
      axis = a;
    }
  });

  if (!axis && count < 2) {
    axis = new Guide(TYPES.AXIS, def.type, scale._id);
    axis.title = def.title;
    axis.layer = def.layer;
    axis.grid = def.grid;
    axis.orient = def.orient || axis.orient;
    if (count === 1) {
      axis.orient = SWAP_ORIENT[axis.orient];
    }
    dl.extend(axis.properties, def.properties);
    this.parent().child('axes', axis);
  }
}

/**
 * Attempts to find a legend for the given scale. If one is not found, a new
 * Lyra legend Guide primitive is constructed.
 *
 * @memberOf rules.guides
 * @param  {Scale}  scale A Lyra Scale primitive.
 * @param  {Object} defs  A parsed Vega legend definition.
 * @param  {string} property The Lyra mark's property that was just bound.
 * @return {void}
 */
function legend(scale, defs, property) {
  var map = this._rule._map.scales,
      legends = this.parent().legends,
      def = defs.find(function(d) {
        return map[d[property]] === scale._id;
      }),
      legend = legends.find(function(l) {
        return lookup(l)[property] === scale._id;
      });

  if (!legend) {
    legend = new Guide(TYPES.LEGEND, property, scale._id);
    legend.title = def.title;
    this.parent().child('legends', legend);
  }
}

module.exports = guides;
