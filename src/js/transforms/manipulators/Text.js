'use strict';
var inherits = require('inherits'),
    Base = require('./Manipulators'),
    spec = require('../../model/primitives/marks/manipulators'),
    CONST = spec.CONST,
    PX = CONST.PADDING,
    SP = CONST.STROKE_PADDING,
    A = CONST.ARROWHEAD;

/**
 * @classdesc Represents the TextManipulators, a Vega data transformation operator.
 *
 * @description The TextManipulators calculates manipulators when a text mark
 * instance is selected.
 * @extends Manipulators
 *
 * @constructor
 */
function TextManipulators(graph) {
  return Base.call(this, graph);
}

inherits(TextManipulators, Base);

TextManipulators.prototype.handles = function(item) {
  var c = spec.coords(item.bounds, 'handle');
  return [
    c.topLeft,
    c.bottomRight
  ];
};

TextManipulators.prototype.connectors = function(item) {
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

TextManipulators.prototype.channels = function(item) {
  var b = item.bounds,
      gb = item.mark.group.bounds,
      c = spec.coords(b),
      m = c.midCenter;

  return []
    // x
    .concat([
      {x: gb.x1, y: m.y}, {x: m.x - PX, y: m.y}
    ].map(map('x', 'arrow')))
    // y
    .concat([
      {x: m.x, y: gb.y1}, {x: m.x, y: m.y - SP}
    ].map(map('y', 'arrow')));
};

TextManipulators.prototype.altchannels = TextManipulators.prototype.channels;

module.exports = TextManipulators;
