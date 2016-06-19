'use strict';

var GTYPES = {AXIS: 'axis', LEGEND: 'legend'},
    ORIENT = {x: 'bottom', y: 'left'};

/**
 * The definition of a Lyra guide (axis or legend).
 *
 * @param {number} gtype - Axis or Legend (use enumerated `Guide.TYPES`).
 * @param {string} type - Axis/legend type (e.g., `x` axis, or `fill` legend).
 * @param {number|Object} scale - The ID or Lyra Scale Primitive that backs the guide.
 *
 * @property {number} _gtype - Axis or Legend (based on enumerate `Guide.TYPES`).
 * @property {string} _type - Type for legends (e.g., `fill`, `stroke`, etc.).
 * @see Vega's {@link https://github.com/vega/vega/wiki/Axes|Axes} or
 * {@link https://github.com/vega/vega/wiki/Legends|Legends} documentation for
 * more information on this class' "public" properties.
 */

var def = module.exports = function(gtype, type, scale) {
  var guide = {_gtype: gtype};

  if (gtype === GTYPES.AXIS) {
    guide.type = type;
    guide.scale = +scale || scale.get('_id');
    guide.orient = ORIENT[type];
    guide.properties = {
      ticks: {},
      majorTicks: {},
      minorTicks: {},
      title: {},
      labels: {},
      axis: {}
    };
  } else if (gtype === GTYPES.LEGEND) {
    guide._type = type;
    guide[type] = +scale || scale.get('_id');
    guide.properties = {
      title: {},
      labels: {},
      symbols: {},
      gradient: {},
      legend: {}
    };
  }

  guide.title = undefined;
  return guide;
};

def.GTYPES = GTYPES;
def.ORIENT = ORIENT;
