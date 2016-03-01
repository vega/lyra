var Primitive = require('./Primitive'),
    model = require('../'),
    lookup = model.primitive;

var GTYPES = {AXIS: 1, LEGEND: 2},
    ORIENT = {x: 'bottom', y: 'left'};
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

var prototype = (Guide.prototype = Object.create(Primitive.prototype));
prototype.constructor = Guide;

// TODO: Map guide properties to signals.
prototype.init = function() {
  return this;
};

prototype.export = prototype.manipulators = function(resolve) {
  var spec = Primitive.prototype.export.call(this, resolve),
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
