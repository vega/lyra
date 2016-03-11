'use strict';
var inherits = require('inherits'),
    Base = require('./Manipulators'),
    spec = require('../../model/primitives/marks/manipulators'),
    map = require('../../util/map-manipulator'),
    CONST = spec.CONST,
    PX = CONST.PADDING,
    SP = CONST.STROKE_PADDING;

/**
 * @classdesc Represents the AreaManipulators, a Vega data transformation operator.
 *
 * @description The AreaManipulators calculates manipulators when a Area
 * mark instance is selected.
 * @extends Manipulators
 *
 * @param {Model} graph - A Vega model.
 *
 * @constructor
 */
function AreaManipulators(graph) {
  return Base.call(this, graph);
}

inherits(AreaManipulators, Base);

AreaManipulators.prototype.handles = function(item) {
  var bounds = item.mark.bounds;
  var c = spec.coords(bounds, 'handle');
  return [
    c.topLeft, c.topRight,
    c.bottomLeft, c.bottomRight
  ];
};

AreaManipulators.prototype.connectors = function(item) {
  var bounds = item.mark.bounds;
  var c = spec.coords(bounds, 'connector');
  return [c.midCenter];
};

AreaManipulators.prototype.channels = function(item) {
  var b = item.mark.bounds,
      gb = item.mark.group.bounds,
      c = spec.coords(b),
      m = c.midCenter;

  return []
    // x
    .concat([
      {x: gb.x1, y: m.y}, {x: m.x - PX, y: m.y}
    ].map(map('x', 'span')))
    // y
    .concat([
      {x: m.x, y: gb.y1}, {x: m.x, y: m.y - SP}
    ].map(map('y', 'span')));
};

AreaManipulators.prototype.altchannels = AreaManipulators.prototype.channels;
module.exports = AreaManipulators;
