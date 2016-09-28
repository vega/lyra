'use strict';
var inherits = require('inherits'),
    Manipulators = require('./Manipulators'),
    spec = require('../../ctrl/manipulators'),
    annotate = require('../../util/annotate-manipulators'),
    CONST = spec.CONST,
    PAD = CONST.PADDING;

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
  return Manipulators.call(this, graph);
}

inherits(AreaManipulators, Manipulators);

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
    ].map(annotate('fill', 'border')))
    .concat(facets);
};

AreaManipulators.prototype.altchannels = function(item) {
  var b  = item.mark.bounds,
      c = spec.coords(b),
      m = c.midCenter,
      path = item.mark.items[0].pathCache;

  path = path.map(function(d) {
    return d.join(' ');
  }).join(' ');

  return [
    {x: m.x, y: m.y, path: path}
  ].map(annotate('stroke', 'border'));
};

module.exports = AreaManipulators;
