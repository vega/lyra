'use strict';
var inherits = require('inherits'),
    Primitive = require('./Primitive'),
    model = require('../'),
    lookup = model.lookup;


var GTYPES = {AXIS: 1, LEGEND: 2},
    ORIENT = {x: 'bottom', y: 'left'};

/**
 * @classdesc A Lyra Guide Primitive.
 *
 * @description The Guide Primitive corresponds to a definition for a Vega
 * axis or legend.
 * @extends {Primitive}
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
function Guide(gtype, type, scale) {
  this._gtype = gtype;

  if (gtype === GTYPES.AXIS) {
    this.type = type;
    this.scale = +scale || scale._id;
    this.orient = ORIENT[type];
    this.properties = {
      ticks: {},
      majorTicks: {},
      minorTicks: {},
      title: {},
      labels: {},
      axis: {}
    };
  } else if (gtype === GTYPES.LEGEND) {
    this._type = type;
    this[type] = +scale || scale._id;
    this.properties = {
      title: {},
      labels: {},
      symbols: {},
      gradient: {},
      legend: {}
    };
  }

  this.title = undefined;
  return Primitive.call(this);
}

inherits(Guide, Primitive);

// @TODO: Map guide properties to signals.
Guide.prototype.init = function() {
  return this;
};

Guide.prototype.export = Guide.prototype.manipulators = function(clean) {
  var spec = Primitive.prototype.export.call(this, clean),
      gtype = this._gtype,
      type = this._type;

  if (gtype === GTYPES.AXIS) {
    spec.scale = lookup(spec.scale).name;
  } else if (gtype === GTYPES.LEGEND) {
    spec[type] = lookup(spec[type]).name;
  }

  return spec;
};

module.exports = Guide;
Guide.TYPES = GTYPES;
