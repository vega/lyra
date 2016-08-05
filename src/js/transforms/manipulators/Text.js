'use strict';
var dl = require('datalib'),
    inherits = require('inherits'),
    Manipulators = require('./Manipulators'),
    spec = require('../../ctrl/manipulators'),
    annotate = require('../../util/annotate-manipulators'),
    CONST = spec.CONST,
    PAD = CONST.PADDING,
    PAD15 = 1.5 * PAD;

/**
 * @classdesc Represents the TextManipulators, a Vega data transformation operator.
 *
 * @description The TextManipulators calculates manipulators when a text mark
 * instance is selected.
 * @extends Manipulators
 *
 * @constructor
 * @param {Object} graph - A Vega model.
 */
function TextManipulators(graph) {
  return Manipulators.call(this, graph);
}

inherits(TextManipulators, Manipulators);

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

TextManipulators.prototype.channels = function(item) {
  var b = item.bounds,
      gb = item.mark.group.bounds,
      c = spec.coords(b),
      m = c.midCenter;

  return []
    // x
    .concat([
      {x: gb.x1, y: m.y}, {x: m.x - PAD15, y: m.y}
    ].map(annotate('x', 'span')))
    // y
    .concat([
      {x: m.x, y: gb.y1}, {x: m.x, y: m.y - PAD15}
    ].map(annotate('y', 'span')))
    // text
    .concat([
      dl.extend({}, item, {bounds: null, _id: null})
    ].map(annotate('text', 'border')));
};

TextManipulators.prototype.altchannels = function(item) {
  return [
    dl.extend({}, item, {bounds: null, _id: null})
  ].map(annotate('fill', 'border'));
};

module.exports = TextManipulators;
