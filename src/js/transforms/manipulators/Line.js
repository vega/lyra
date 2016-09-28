'use strict';
var inherits = require('inherits'),
    Manipulators = require('./Manipulators'),
    spec = require('../../ctrl/manipulators'),
    annotate = require('../../util/annotate-manipulators'),
    CONST = spec.CONST,
    PAD = CONST.PADDING;

/**
 * @classdesc Represents the LineManipulators, a Vega data transformation operator.
 *
 * @description The LineManipulators calculates manipulators when a Line
 * mark instance is selected.
 * @extends Manipulators
 *
 * @param {Model} graph - A Vega model.
 *
 * @constructor
 */
function LineManipulators(graph) {
  return Manipulators.call(this, graph);
}

inherits(LineManipulators, Manipulators);

LineManipulators.prototype.handles = function(item) {
  var bounds = item.mark.bounds;
  var c = spec.coords(bounds, 'handle');
  return [
    c.topLeft, c.topRight,
    c.bottomLeft, c.bottomRight
  ];
};

LineManipulators.prototype.connectors = function(item) {
  var bounds = item.mark.bounds;
  var c = spec.coords(bounds, 'connector');
  return [c.midCenter];
};

LineManipulators.prototype.channels = function(item) {
  var b  = item.mark.bounds,
      gb = item.mark.group.bounds,
      path = item.mark.items[0].pathCache,
      c = spec.coords(b),
      m = c.midCenter,
      facets = Manipulators.prototype.channels.call(this, item);

  return []
    // x
    .concat([
      {x: gb.x1, y: item.y}, {x: item.x - PAD, y: item.y}
    ].map(annotate('x', 'span')))
    // y
    .concat([
      {x: item.x, y: gb.y1}, {x: item.x, y: item.y - PAD}
    ].map(annotate('y', 'span')))
    // stroke
    .concat([
      {x: m.x, y: m.y, path: path.map((d) => d.join(' ')).join(' ')}
    ].map(annotate('stroke', 'border')))
    .concat(facets);
};

LineManipulators.prototype.altchannels = LineManipulators.prototype.channels;
module.exports = LineManipulators;
