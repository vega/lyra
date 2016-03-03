'use strict';
var Base = require('./Manipulators'),
    spec = require('../../model/primitives/marks/manipulators'),
    inherits = require('inherits'),
    CONST = spec.CONST,
    PX = CONST.PADDING,
    SP = CONST.STROKE_PADDING;

/**
 * @classdesc Represents the SymbolManipulators, a Vega data transformation operator.
 *
 * @description The SymbolManipulators calculates manipulators when a symbol
 * mark instance is selected.
 * @extends Manipulators
 *
 * @constructor
 */
function SymbolManipulators(graph) {
  return Base.call(this, graph);
}

inherits(SymbolManipulators, Base);

SymbolManipulators.prototype.handles = function(item) {
  var c = spec.coords(item.bounds, 'handle');
  return [
    c.topLeft, c.topRight,
    c.bottomLeft, c.bottomRight
  ];
};

SymbolManipulators.prototype.connectors = function(item) {
  var c = spec.coords(item.bounds, 'connector');
  return [c.midCenter];
};

function map(key, manipulator) {
  return function(d) {
    d.key = key;
    d.manipulator = manipulator;
    return d;
  };
}

SymbolManipulators.prototype.channels = function(item) {
  var b = item.bounds,
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

SymbolManipulators.prototype.altchannels = SymbolManipulators.prototype.channels;
module.exports = SymbolManipulators;
