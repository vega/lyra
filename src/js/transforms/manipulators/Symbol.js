import {inherits, extend, Transform} from 'vega';
import Manipulators from './Manipulators';
import annotate from '../../util/annotate-manipulators';
import {coords, PADDING as PAD} from '../../ctrl/manipulators';

const PAD35 = 3.5 * PAD;
const DELTA = 0.01;

/**
 * @classdesc Represents the SymbolManipulators, a Vega data transformation operator.
 * @param {Model} graph - A Vega model.
 * @description The SymbolManipulators calculates manipulators when a symbol
 * mark instance is selected.
 * @extends Manipulators
 * @constructor
 */
export default function SymbolManipulators(params) {
  Manipulators.call(this, [], params);
}

SymbolManipulators.Definition = extend({}, Manipulators.Definition);

const prototype = inherits(SymbolManipulators, Manipulators);

prototype.handles = function(item) {
  var c = coords(item.bounds, 'handle');
  return [
    c.topLeft, c.topRight,
    c.bottomLeft, c.bottomRight
  ];
};

prototype.connectors = function(item) {
  var c = coords(item.bounds, 'connector');
  return [c.midCenter];
};

prototype.channels = function(item) {
  var b = item.bounds,
      gb = item.mark.group.bounds,
      c = coords(b),
      m = c.midCenter;

  return []
    // x
    .concat([
      {x: gb.x1, y: m.y}, {x: m.x - PAD35, y: m.y, _voronoi: false}
    ].map(annotate('x', 'span')))
    // y
    .concat([
      {x: m.x, y: gb.y1}, {x: m.x, y: m.y - PAD35, _voronoi: false}
    ].map(annotate('y', 'span')))
    // size
    .concat([
      {x: item.x + DELTA, y: item.y - DELTA, shape: item.shape, size: item.size}
    ].map(annotate('size', 'border')))
    // fill
    .concat([
      {x: item.x - DELTA, y: item.y + DELTA, shape: item.shape, size: PAD * item.size}
    ].map(annotate('fill', 'border')));
};

prototype.altchannels = function(item) {
  return []
    // shape
    .concat([
      {x: item.x + DELTA, y: item.y + DELTA, shape: item.shape, size: item.size}
    ].map(annotate('shape', 'border')))
    // stroke
    .concat([
      {x: item.x - DELTA, y: item.y, shape: item.shape, size: PAD * item.size}
    ].map(annotate('stroke', 'border')));
};
