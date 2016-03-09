'use strict';
var dl = require('datalib'),
    inherits = require('inherits'),
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
  // @TODO!
};

function map(key, manipulator) {
  return function(d) {
    d.key = key;
    d.manipulator = manipulator;
    return d;
  };
}

TextManipulators.prototype.channels = function(item) {
  // @TODO!
};

TextManipulators.prototype.altchannels = TextManipulators.prototype.channels;

module.exports = TextManipulators;
