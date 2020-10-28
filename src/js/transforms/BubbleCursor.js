import {inherits, Transform, tupleid, ingest, extend} from 'vega';
import duplicate from '../util/duplicate';

/**
 * @classdesc Represents the BubbleCursor, a Vega data transformation operator.
 *
 * @description The BubbleCursor transform uses the user's mouse position
 * and a voronoi tessellation computed for the current Lyra manipulator type to
 * indicate which manipulator is currently selected. This is indicated on the
 * visualization with a shaded region.
 *
 * @param {string} graph - A Vega model.
 * @returns {Object} A Vega-Dataflow Node.
 *
 * @property {number} _cellID - The ID of voronoi cell the mouse is over.
 * @property {Object[]} _cache - A cache of previously calculated bubble cursor
 * coordinates which is reused if the transform is reevaluated for the same cell.
 * @property {Object} _start - The first coordinate of the bubble cursor region.
 * @property {Object} _end - The last coordinate of the bubble cursor region.
 * @property {Object} _mouse - The user's current mouse position.
 *
 * @constructor
 */
export default function BubbleCursor(params) {
  Transform.call(this, [], params);
  this._cellID = null;
  this._start = ingest({});
  this._end = ingest({});
  this._mouseCache = {x: -1, y: -1};
}

BubbleCursor.Definition = {
  metadata: {source: true, changes: true},
  params: [
    {name: 'lyra_cell', required: true},
    {name: 'lyra_mouse', required: true}
  ]
}

const prototype = inherits(BubbleCursor, Transform);

/**
 * The transform method is automatically called by Vega whenever the bubble
 * cursor region needs to be recalculated (e.g., when the user moves the mouse).
 */
prototype.transform = function(_, pulse) {
  const cell = _.lyra_cell;
  const mouse = _.lyra_mouse;
  const mouseCache = this._mouseCache;
  const cellID = this._cellID;
  const start = this._start;
  const end = this._end;
  const cache = this.value || [];
  const out = pulse.fork(pulse.NO_FIELDS & pulse.NO_SOURCE);

  if (cache.length && cellID !== tupleid(cell)) {
    out.rem = cache.splice(0);
  }

  if (!tupleid(cell)) {
    return (out.source = this.value = cache, out);
  }

  // Voronoi cells always come at the end of the group of manipulators
  let item = cell.mark.group;
  const type = cell.datum.manipulator;
  const manipulators = findManipulator(cell);
  const offset = {x: 0, y: 0};

  // If we're still in the same cell, we only need to update
  // the mouse points.
  if (cache.length && (mouseCache.x !== mouse.x || mouseCache.y !== mouse.y)) {
    out.mod.push(extend(start, mouse));
    out.mod.push(extend(end, mouse));
  } else if (!cache.length) {
    cache.push(extend(start, mouse));

    for (; item; item = item.mark && item.mark.group) {
      offset.x += item.x || 0;
      offset.y += item.y || 0;
    }

    if (type === 'arrow' || type === 'span') {
      cache.push.apply(cache, manipulators.map(i => ingest({x: i.x + offset.x, y: i.y + offset.y})));
    } else {
      const b = manipulators[0].bounds || manipulators[0].mark.bounds;
      cache.push.apply(cache, [
        {x: b.x1, y: b.y1}, {x: b.x2, y: b.y1}, {x: b.x2, y: b.y2}
      ].map(ingest));
    }

    cache.push(extend(end, mouse));
    out.add = cache;
    this._cellID = tupleid(cell);
  }

  this._mouseCache = mouse;
  return (out.source = this.value = cache, out);
};

function findManipulator(cell) {
  const group = cell.mark.group;
  const manipulator = cell.datum.manipulator;
  for (const item of group.items) {
    if (item.role === manipulator) {
      if (item.marktype === 'group') {
        for (const child of item.items) {
          if (child.datum && child.datum.key === cell.datum.key) {
            return child.items[0].items;
          }
        }
      }

      return item.items;
    }
  }

  return null;
}
