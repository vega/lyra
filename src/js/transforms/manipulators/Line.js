import {inherits, extend}  from 'vega';
import Manipulators from './Manipulators';
import annotate from '../../util/annotate-manipulators';
import {coords, PADDING as PAD} from '../../ctrl/manipulators';

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
export default function LineManipulators(params) {
  Manipulators.call(this, [], params);
}

LineManipulators.Definition = extend({}, Manipulators.Definition);

const prototype = inherits(LineManipulators, Manipulators);

prototype.handles = function(item) {
  const bounds = item.mark.bounds;
  const c = coords(bounds, 'handle');
  return [
    c.topLeft, c.topRight,
    c.bottomLeft, c.bottomRight
  ];
};

prototype.connectors = function(item) {
  const bounds = item.mark.bounds;
  const c = coords(bounds, 'connector');
  return [c.midCenter];
};

prototype.channels = function(item) {
  const b  = item.mark.bounds,
      gb = item.mark.group.bounds,
      path = item._svg.getAttribute('d'),
      c = coords(b),
      m = c.midCenter;

  return []
    // x
    .concat([
      {x: gb.x1, y: item.y}, {x: item.x - PAD, y: item.y}
    ].map(annotate('x', 'span')))
    // y
    .concat([
      {x: item.x, y: gb.y1}, {x: item.x, y: item.y - PAD}
    ].map(annotate('y', 'span')))
    .concat([
      {x: m.x, y: m.y, path: path}
    ].map(annotate('stroke', 'border')));
};

prototype.altchannels = prototype.channels;
