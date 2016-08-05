'use strict';
var inherits = require('inherits'),
    Manipulators = require('./Manipulators'),
    spec = require('../../ctrl/manipulators'),
    annotate = require('../../util/annotate-manipulators'),
    CONST = spec.CONST,
    PAD   = CONST.PADDING,
    PAD15 = 3.5 * PAD,
    DELTA = 0.01;

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
      {x: gb.x1, y: m.y}, {x: m.x - PAD15, y: m.y, _voronoi: false}
    ].map(annotate('x', 'span')))
    // y
    .concat([
      {x: m.x, y: gb.y1}, {x: m.x, y: m.y - PAD15, _voronoi: false}
    ].map(annotate('y', 'span')))
    // shape
    .concat([
      {x: item.x + DELTA, y: item.y + DELTA, shape: item.shape, size: item.size}
    ].map(annotate('fill', 'border')))
    // size
    .concat([
      {x: item.x - DELTA, y: item.y, shape: item.shape, size: PAD * item.size}
    ].map(annotate('size', 'border')));
};

SymbolManipulators.prototype.altchannels = function(item) {
  return []
    // shape
    .concat([
      {x: item.x + DELTA, y: item.y + DELTA, shape: item.shape, size: item.size}
    ].map(annotate('stroke', 'border')))
    // stroke
    .concat([
      {x: item.x - DELTA, y: item.y, shape: item.shape, size: PAD * item.size}
    ].map(annotate('shape', 'border')));
};

module.exports = SymbolManipulators;
