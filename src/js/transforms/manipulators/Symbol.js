'use strict';
var inherits = require('inherits'),
    Manipulators = require('./Manipulators'),
    spec = require('../../ctrl/manipulators'),
    annotate = require('../../util/annotate-manipulators'),
    CONST = spec.CONST,
    PAD = CONST.PADDING;

/**
 * @classdesc Represents the SymbolManipulators, a Vega data transformation operator.
 * @param {Model} graph - A Vega model.
 * @description The SymbolManipulators calculates manipulators when a symbol
 * mark instance is selected.
 * @extends Manipulators
 * @constructor
 */
function SymbolManipulators(graph) {
  return Manipulators.call(this, graph);
}

inherits(SymbolManipulators, Manipulators);

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

SymbolManipulators.prototype.channels = function(item) {
  var b = item.bounds,
      gb = item.mark.group.bounds,
      c = spec.coords(b),
      m = c.midCenter;

  return []
    // x
    .concat([
      {x: gb.x1, y: m.y}, {x: m.x - PAD, y: m.y}
    ].map(annotate('x', 'span')))
    // y
    .concat([
      {x: m.x, y: gb.y1}, {x: m.x, y: m.y - PAD}
    ].map(annotate('y', 'span')))
    // Border shape for fill/stroke/opacity
    .concat([
      {x: item.x, y: item.y, shape: item.shape, size: item.size}
    ].map(annotate('fill', 'border')));
};

SymbolManipulators.prototype.altchannels = function(item) {
  return [
    {x: item.x, y: item.y, shape: item.shape, size: item.size}
  ].map(annotate('stroke', 'border'));
};

module.exports = SymbolManipulators;
