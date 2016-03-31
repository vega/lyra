'use strict';
var dl = require('datalib'),
    inherits = require('inherits'),
    Manipulators = require('./Manipulators'),
    spec = require('../../model/primitives/marks/manipulators'),
    map = require('../../util/map-manipulator'),
    CONST = spec.CONST,
    PX = CONST.PADDING,
    SP = CONST.STROKE_PADDING,
    A = CONST.ARROWHEAD;

/**
 * @classdesc Represents the RectManipulators, a Vega data transformation operator.
 *
 * @description The RectManipulators calculates manipulators when a rect mark
 * instance is selected.
 * @extends Manipulators
 * @param {Model} graph - A Vega model.
 * @constructor
 */
function RectManipulators(graph) {
  return Manipulators.call(this, graph);
}

inherits(RectManipulators, Manipulators);

RectManipulators.prototype.handles = function(item) {
  var c = spec.coords(item.bounds, 'handle');
  return dl.vals(c).filter(function(x) {
    return x.key !== 'midCenter';
  });
};

RectManipulators.prototype.connectors = function(item) {
  return dl.vals(spec.coords(item.bounds, 'connector'));
};

RectManipulators.prototype.channels = function(item) {
  var b = item.bounds,
      c = spec.coords(b),
      tl = c.topLeft,
      tr = c.topRight,
      br = c.bottomRight,
      w = b.width(), h = b.height();

  return []
    // Width/horizontal arrow stem
    .concat([
      {x: tl.x, y: tl.y - SP}, {x: tr.x, y: tr.y - SP}, {x: tr.x + w, y: tr.y - SP},
      {x: tr.x + w - A, y: tr.y - 2 * SP}, {x: tr.x + w - A, y: tr.y},
      {x: tr.x + w, y: tr.y - SP + 0.1}
    ].map(map('x+', 'arrow')))
    // Height/vertical arrow stem
    .concat([
      {x: tr.x + PX, y: tr.y}, {x: br.x + PX, y: br.y}, {x: br.x + PX, y: br.y + h},
      {x: br.x + 2 * PX, y: br.y + h - A}, {x: br.x, y: br.y + h - A},
      {x: br.x + PX, y: br.y + h + 0.1}
    ].map(map('y+', 'arrow')));
};

RectManipulators.prototype.altchannels = function(item) {
  var b = item.bounds,
      gb = item.mark.group.bounds,
      c = spec.coords(b),
      tl = c.topLeft, tc = c.topCenter, tr = c.topRight,
      ml = c.midLeft, mr = c.midRight,
      bl = c.bottomLeft, bc = c.bottomCenter, br = c.bottomRight;

  return []
    // x
    .concat([
      {x: gb.x1, y: tl.y}, {x: tl.x - PX, y: tl.y}
    ].map(map('x', 'span')))
    // x2
    .concat([
      {x: gb.x1, y: br.y + SP}, {x: bl.x, y: br.y + SP},
      {x: br.x, y: br.y + SP}
    ].map(map('x2', 'span')))
    // y
    .concat([
      {x: tl.x, y: gb.y1}, {x: tl.x, y: tl.y - SP}
    ].map(map('y', 'span')))
    // y2
    .concat([
      {x: br.x + SP, y: gb.y1}, {x: br.x + SP, y: tr.y},
      {x: br.x + SP, y: br.y}
    ].map(map('y2', 'span')))
    // width
    .concat([ml, mr].map(map('width', 'span')))
    // height
    .concat([tc, bc].map(map('height', 'span')));
};

module.exports = RectManipulators;
