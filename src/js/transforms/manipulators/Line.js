'use strict';
var inherits = require('inherits'),
    Base = require('./Manipulators'),
    spec = require('../../model/primitives/marks/manipulators'),
    CONST = spec.CONST,
    PX = CONST.PADDING,
    SP = CONST.STROKE_PADDING;

/**
 * @classdesc Represents the LineManipulators, a Vega data transformation operator.
 *
 * @description The LineManipulators calculates manipulators when a Line
 * mark instance is selected.
 * @extends Manipulators
 *
 * @constructor
 */
function LineManipulators(graph) {
  return Base.call(this, graph);
}

inherits(LineManipulators, Base);

// lines probably have only 2 handles
LineManipulators.prototype.handles = function(item) {
};

// connectors?
LineManipulators.prototype.connectors = function(item) {
};

// Map should get moved out into it's own function
function map(key, manipulator) {
  return function(d) {
    d.key = key;
    d.manipulator = manipulator;
    return d;
  };
}
//channels
LineManipulators.prototype.channels = function(item) {
};

LineManipulators.prototype.altchannels = LineManipulators.prototype.channels;
module.exports = LineManipulators;
