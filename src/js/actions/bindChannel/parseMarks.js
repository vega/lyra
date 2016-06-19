'use strict';

var propSg = require('../../util/prop-signal'),
    setSignal = require('../signalActions').setSignal,
    markActions = require('../markActions'),
    setMarkVisual = markActions.setMarkVisual,
    disableMarkVisual = markActions.disableMarkVisual;

/**
 * Parses the mark definition in the resultant Vega specification to determine
 * how to update the Lyra mark in the redux store.
 *
 * @param {Function} dispatch  Redux dispatch function.
 * @param {ImmutableMap} state Redux store.
 * @param {Object} parsed      An object containing the parsed and output Vega
 * specifications as well as a mapping of output spec names to Lyra IDs.
 * @returns {void}
 */
module.exports = function(dispatch, state, parsed) {
  var markType = parsed.markType,
      channel  = parsed.channel,
      def = parsed.output.marks[0].marks[0],
      props = def.properties.update;

  if (markType === 'rect' && (channel === 'x' || channel === 'y')) {
    rectSpatial(dispatch, parsed, props);
  } else {
    bindProperty(dispatch, parsed, props);
  }
};

/**
 * Updates a Lyra mark property using the parsed Vega property definition.
 *
 * @param   {Function} dispatch Redux dispatch function.
 * @param   {Object} parsed   An object containing the parsed and output Vega
 * specifications as well as a mapping of output spec names to Lyra IDs.
 * @param   {Object} def      The parsed Vega visual properties for the mark.
 * @param   {string} [property=parsed.property]  The visual property to bind.
 * @returns {void}
 */
function bindProperty(dispatch, parsed, def, property) {
  var map = parsed.map,
      markId = parsed.markId,
      markType = parsed.markType,
      prop = {};
  property = property || parsed.property;
  def = def[property];

  if (def.scale !== undefined) {
    prop.scale = map.scales[def.scale];
  }

  if (def.field !== undefined) {
    if (def.field.group) {
      prop.group = def.field.group;
    } else {
      prop.field = def.field;
    }
  }

  if (def.value !== undefined) {
    prop.signal = propSg(markId, markType, property);
    dispatch(setSignal(prop.signal, def.value));
  }

  if (def.band !== undefined) {
    prop.band = def.band;
  }

  if (def.offset !== undefined) {
    prop.offset = def.offset;
  }

  dispatch(setMarkVisual(markId, property, prop));
}

/**
 * Binding a spatial channel of a rect mark requires binding two properties.
 * For example, Vega-Lite produces center/span (e.g., xc/width) properties when
 * using an ordinal-point scale. However, Lyra prefers using start/span.
 *
 * @param   {Function} dispatch Redux dispatch function.
 * @param   {Object} parsed   An object containing the parsed and output Vega
 * specifications as well as a mapping of output spec names to Lyra IDs.
 * @param   {Object} def      The parsed Vega visual properties for the mark.
 * @returns {void}
 */
var RECT_SPANS = {x: 'width', y: 'height'};
function rectSpatial(dispatch, parsed, def) {
  var channel  = parsed.channel,
      property = parsed.property,
      markId = parsed.markId,
      max  = channel + '2',
      cntr = channel + 'c',
      span = RECT_SPANS[channel];

  // If we're binding a literal spatial property (i.e., not arrow manipulators),
  // bind only that property.
  if (property !== channel + '+') {
    def[property] = def[property] || def[channel] || def[cntr];
    return bindProperty(dispatch, parsed, def);
  }

  if (def[max]) {
    bindProperty(dispatch, parsed, def, channel);
    bindProperty(dispatch, parsed, def, max);
    dispatch(disableMarkVisual(markId, property));
  } else {
    def[channel] = def[cntr];  // Map xc/yc => x/y for binding.
    bindProperty(dispatch, parsed, def, channel);

    def[span] = {
      scale: def[channel].scale,
      band: true, offset: -1
    };
    bindProperty(dispatch, parsed, def, span);

    dispatch(disableMarkVisual(markId, max));
  }
}
