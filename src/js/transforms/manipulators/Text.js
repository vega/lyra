import {inherits, extend, Transform} from 'vega';
import Manipulators from './Manipulators';
import annotate from '../../util/annotate-manipulators';
import {coords, PADDING as PAD} from '../../ctrl/manipulators';

const PAD15 = 1.5 * PAD;

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
export default function TextManipulators(params) {
  Manipulators.call(this, [], params);
}

TextManipulators.Definition = extend({}, Manipulators.Definition);

const prototype = inherits(TextManipulators, Manipulators);

prototype.handles = function(item) {
  var c = coords(item.bounds, 'handle');
  return [
    c.topLeft,
    c.bottomRight
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
      {x: gb.x1, y: m.y}, {x: m.x - PAD15, y: m.y}
    ].map(annotate('x', 'span')))
    // y
    .concat([
      {x: m.x, y: gb.y1}, {x: m.x, y: m.y - PAD15}
    ].map(annotate('y', 'span')))
    // text
    .concat([
      extend({}, item, {bounds: null, _id: null})
    ].map(annotate('text', 'border')));
};

prototype.altchannels = function(item) {
  return [
    extend({}, item, {bounds: null, _id: null})
  ].map(annotate('fill', 'border'));
};
