'use strict';

var vgCfg = require('vega').config,
    axisDef = vgCfg.axis,
    legendDef = vgCfg.legend,
    GTYPES = {AXIS: 'axis', LEGEND: 'legend'},
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

var def = module.exports = function(gtype, type, scale) {
  var guide = {_gtype: gtype};

  if (gtype === GTYPES.AXIS) {
    guide.type = type;
    guide.scale = +scale || scale.get('_id');
    guide.orient = ORIENT[type];
    // guide.titleOffset = 100;
    guide.ticks = 10;
    guide.tickPadding = 5;
    guide.tickSize = 10;
    guide.grid = false;
    guide.layer = 'back';
    guide.properties = {
      ticks: {
        stroke: {
          value: axisDef.tickColor
        },
        strokeWidth: {
          value: axisDef.tickWidth
        }
      },

      // Don't include definitions for major/minorTicks by default, and instead
      // only add them if the user explicitly desires separate styling.

      // majorTicks: {
      //   stroke: {
      //     value: '#000000'
      //   },
      //   strokeWidth: {
      //     value: 1
      //   }
      // },
      // minorTicks: {
      //   stroke: {
      //     value: '#000000'
      //   },
      //   strokeWidth: {
      //     value: 1
      //   }
      // },

      title: {
        fill: {
          value: axisDef.titleColor
        },
        fontSize: {
          value: axisDef.titleFontSize
        }
      },
      labels: {
        fill: {
          value: axisDef.tickLabelColor
        },
        fontSize: {
          value: axisDef.tickLabelFontSize
        },
        angle: {
          value: 0
        }
      },
      axis: {
        stroke: {
          value: axisDef.axisColor
        },
        strokeWidth: {
          value: axisDef.axisWidth
        }
      },
      grid: {
        stroke: {
          value: axisDef.gridColor
        },
        strokeWidth: {
          value: 1
        },
        strokeOpacity: {
          value: axisDef.gridOpacity
        }
      }
    };
  } else if (gtype === GTYPES.LEGEND) {
    guide._type = type;
    guide[type] = +scale || scale.get('_id');
    guide.orient = legendDef.orient;
    guide.properties = {
      title: {
        fill: {
          value: legendDef.titleColor
        },
        fontSize: {
          value: legendDef.titleFontSize
        }
      },
      labels: {
        fill: {
          value: legendDef.labelColor
        },
        fontSize: {
          value: legendDef.labelFontSize
        },
      },
      symbols: {
        shape: {
          value: legendDef.symbolShape
        },
        size: {
          value: legendDef.symbolSize
        },
        fill: {
          value: '#ffffff'
        },
        fillOpacity: {
          value: 1
        },
        stroke: {
          value: legendDef.symbolColor
        },
        strokeWidth: {
          value: legendDef.symbolStrokeWidth
        }
      },
      gradient: {
        stroke: {
          value: legendDef.gradientStrokeColor
        },
        strokeWidth: {
          value: legendDef.gradientStrokeWidth
        },
        height: {
          value: legendDef.gradientHeight
        },
        width: {
          value: legendDef.gradientWidth
        }
      },
      legend: {
        stroke: {
          value: '#ffffff'
        },
        strokeWidth: {
          value: 0
        }
      }
    };
  }

  guide.title = undefined;
  return guide;
};

def.GTYPES = GTYPES;
def.ORIENT = ORIENT;
