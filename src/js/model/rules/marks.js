'use strict';
var model = require('../'),
    sg = require('../signals'),
    propSg = require('../../util/prop-signal'),
    store = require('../../store'),
    signalSet = require('../../actions/signalSet'),
    setProperty = require('../../actions/ruleActions').setProperty,
    disableProperty = require('../../actions/ruleActions').disableProperty,
    lookup = model.lookup;

/**
 * Updates a Lyra mark property using a parsed Vega property definition.
 *
 * @memberOf rules.marks
 * @param  {string} property The Lyra mark property to update.
 * @param  {Object} def      The parsed Vega mark property definition.
 * @param  {Object} map      The rule map which associates names found in the
 * parsed Vega spec to Lyra Primitive IDs.
 * @param  {DataSet} from    The backing Lyra Dataset primitive.
 * @returns {void}
 */
function bindProperty(property, def, map, from) {
  var defProp = def[property],
      prop = {};

  if (typeof defProp.scale !== 'undefined') {
    prop.scale = map.scales[defProp.scale];
  }

  if (typeof defProp.field !== 'undefined') {
    if (defProp.field.group) {
      prop.group = defProp.field.group;
    } else {
      prop.field = from.schema()[defProp.field]._id;
    }
  }

  if (typeof defProp.value !== 'undefined') {
    prop.signal = propSg(this, property);
    store.dispatch(signalSet(prop.signal, defProp.value));
  }

  if (typeof defProp.band !== 'undefined') {
    prop.band = defProp.band;
  }

  if (typeof defProp.offset !== 'undefined') {
    prop.offset = defProp.offset;
  }

  // Set the updated/bound property object on the mark instance
  store.dispatch(setProperty(this._id, property, prop));
}

/**
 * Binding a spatial channel of a rect mark requires binding two properties.
 * For example, Vega-Lite produces center/span (e.g., xc/width) properties when
 * using an ordinal-point scale. However, Lyra prefers using start/span.
 *
 * @memberOf rules.marks
 * @param  {string} property The Lyra mark property to update.
 * @param  {string} channel  The corresponding Vega-Lite channel.
 * @param  {Object} def      The parsed Vega mark property definition.
 * @param  {Object} map      The rule map which associates names found in the
 * parsed Vega spec to Lyra Primitive IDs.
 * @param  {Dataset} from    The backing Lyra Dataset primitive.
 * @returns {void}
 */
var RECT_SPANS = {x: 'width', y: 'height'};
function rectSpatial(property, channel, def, map, from) {
  var max = channel + '2',
      cntr = channel + 'c',
      span = RECT_SPANS[channel];

  // If we're binding to a literal spatial property (i.e., span
  // manipulators not arrows), bind only that property.
  if (property !== channel + '+') {
    def[property] = def[property] || def[channel] || def[cntr];
    return bindProperty.call(this, property, def, map, from);
  }

  if (def[max]) {
    bindProperty.call(this, channel, def, map, from);
    bindProperty.call(this, max, def, map, from);
    // updateProps[span]._disabled = true;
    store.dispatch(disableProperty(this._id, span));
  } else {
    def[channel] = def[cntr]; // Map xc/yc => x/y for binding.
    bindProperty.call(this, channel, def, map, from);

    // Width/height should use bandWidth
    def[span] = {
      scale: def[channel].scale,
      band: true,
      offset: -1
    };
    bindProperty.call(this, span, def, map, from);

    // updateProps[max]._disabled = true;
    store.dispatch(disableProperty(this._id, max));
  }
}

/**
 * Parses the mark definition in the resultant Vega specification to determine
 * how to update the Lyra mark primitive.
 *
 * @namespace rules.marks
 * @memberOf rules
 * @param  {Object} parsed   An object containing the parsed rule and output Vega spec.
 * @param  {string} property The Lyra mark's property that was just bound.
 * @param  {string} channel  The corresponding Vega-Lite channel
 * @returns {void}
 */
function marks(parsed, property, channel) {
  var map = this._rule._map,
      def = parsed.spec.marks[0].marks[0],
      dprops = def.properties.update,
      from;

  if (def.from && def.from.data) {
    this.dataset(map.data[def.from.data]);
    from = lookup(this.from);
  }

  // Rect mark's spatial properties are handled separately as we need to account
  // for the four extent properties (x/x2/xc/width, y/y2/yc/height).
  if (this.type === 'rect' && (channel === 'x' || channel === 'y')) {
    rectSpatial.call(this, property, channel, dprops, map, from);
  } else {
    bindProperty.call(this, property, dprops, map, from);
  }
}

module.exports = marks;
