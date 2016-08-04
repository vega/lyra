'use strict';
var dl = require('datalib'),
    inherits = require('inherits'),
    Manipulators = require('./Manipulators'),
    spec = require('../../ctrl/manipulators'),
    annotate = require('../../util/annotate-manipulators'),
    CONST = spec.CONST,
    PAD   = CONST.PADDING,
    APAD  = CONST.ARROWHEAD,
    PAD2  = PAD * 2;

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
      {x: tl.x, y: tl.y - PAD}, {x: tr.x, y: tr.y - PAD}, {x: tr.x + w, y: tr.y - PAD},
      {x: tr.x + w - APAD, y: tr.y - 2 * PAD}, {x: tr.x + w - APAD, y: tr.y},
      {x: tr.x + w, y: tr.y - PAD + 0.1}
    ].map(annotate('x+', 'arrow')))
    // Height/vertical arrow stem
    .concat([
      {x: tr.x + PAD, y: tr.y}, {x: br.x + PAD, y: br.y}, {x: br.x + PAD, y: br.y + h},
      {x: br.x + 2 * PAD, y: br.y + h - APAD}, {x: br.x, y: br.y + h - APAD},
      {x: br.x + PAD, y: br.y + h + 0.1}
    ].map(annotate('y+', 'arrow')))
    // Border shape for fill
    .concat([
      {x: item.x, y: item.y, x2: item.x2, y2: item.y2,
        width: item.width, height: item.height, shape: item.shape}
    ].map(annotate('fill', 'border')));
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
      {x: gb.x1, y: tl.y}, {x: tl.x - PAD2, y: tl.y}
    ].map(annotate('x', 'span')))
    // x2
    .concat([
      {x: gb.x1, y: br.y + PAD}, {x: bl.x, y: br.y + PAD},
      {x: br.x, y: br.y + PAD}
    ].map(annotate('x2', 'span')))
    // y
    .concat([
      {x: tl.x, y: gb.y1}, {x: tl.x, y: tl.y - PAD2}
    ].map(annotate('y', 'span')))
    // y2
    .concat([
      {x: br.x + PAD, y: gb.y1}, {x: br.x + PAD, y: tr.y},
      {x: br.x + PAD, y: br.y}
    ].map(annotate('y2', 'span')))
    // width
    .concat([
      {x: ml.x, y: tr.y - PAD}, {x: mr.x, y: tr.y - PAD}
    ].map(annotate('width', 'span')))
    // height
    .concat([
      {x: bl.x - PAD, y: tc.y}, {x: bl.x - PAD, y: bc.y}
    ].map(annotate('height', 'span')))
    // Border shape for stroke
    .concat([
      {x: item.x, y: item.y, x2: item.x2, y2: item.y2,
        width: item.width, height: item.height, shape: item.shape}
    ].map(annotate('stroke', 'border')));
};

module.exports = RectManipulators;
