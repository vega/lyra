'use strict';

var GTYPES = {AXIS: 'axis', LEGEND: 'legend'},
    ORIENT = {x: 'bottom', y: 'left'};

/**
 * A factory to produce a Lyra guide (axis or legend).
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
 *
 * @constructor
 */

// TODO: add defaults for legends
var def = module.exports = function(gtype, type, scale) {
  var guide = {_gtype: gtype};

  if (gtype === GTYPES.AXIS) {
    guide.type = type;
    guide.scale = +scale || scale.get('_id');
    guide.orient = ORIENT[type];
    guide.titleOffset = 100;
    guide.ticks = 10;
    guide.tickPadding = 5;
    guide.tickSize = 10;
    guide.grid = false;
    guide.layer = 'back';
    guide.properties = {
      ticks: {
        stroke: {
          value: '#000000'
        },
        strokeWidth: {
          value: 1
        }
      },
      majorTicks: {
        stroke: {
          value: '#000000'
        },
        strokeWidth: {
          value: 1
        }
      },
      minorTicks: {
        stroke: {
          value: '#000000'
        },
        strokeWidth: {
          value: 1
        }
      },
      title: {
        fill: {
          value: '#000000'
        },
        fontSize: {
          value: 14
        }
      },
      labels: {
        fontSize: {
          value: 12
        },
        fill: {
          value: '#000000'
        },
        angle: {
          value: 0
        }
      },
      axis: {
        stroke: {
          value: '#000000',
        },
        strokeWidth: {
          value: 1
        }
      }
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
