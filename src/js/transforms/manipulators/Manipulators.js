import {inherits, Transform, tupleid, ingest, extend} from 'vega';

/**
 * @classdesc Represents the Manipulators, a Vega data transformation operator.
 *
 * @description The Manipulators transform is a base class that should be
 * subclassed for each mark type. It provides the base transform methods that
 * compute the data to drive the manipulator mark specifications when in a
 * particular manipulator mode for a selected visualization mark item.
 *
 * @param {string} graph - A Vega model.
 * @returns {Object} A Vega-Dataflow Node.
 *
 * @property {number} _cacheID - The ID the selected mark item from the previous
 * evaluation.
 * @property {string} _cacheMode - The manipulator mode from the previous
 * evaluation.
 * @property {Object[]} _cache - A cache of previously calculated coordinates
 * for the corresponding _cacheID and _cacheMode.
 * @property {Object} _voronoi - A Vega Voronoi data transformation.
 *
 * @constructor
 */
export default function Manipulators(params) {
  Transform.call(this, [], params);
}

Manipulators.Definition = {
  metadata: {source: true, changes: true},
  params: [
    {name: 'lyra_id', type: 'number', required: true},
    {name: 'lyra_selected', required: true},
    {name: 'lyra_mode', required: true},
    {name: 'signals', array: true}
  ]
}

const prototype = inherits(Manipulators, Transform);

/**
 * The transform method is automatically called by Vega whenever the manipulator
 * coordinates need to be recalculated (e.g., when a new mark item is selected).
 * @param {Object} input - A Vega-Dataflow ChangeSet.
 * @returns {Object} output - A Vega-Dataflow ChangeSet.
 */
prototype.transform = function(_, pulse) {
  const cache = this.value || [];
  const out = pulse.fork(pulse.NO_FIELDS & pulse.NO_SOURCE);
  const lyraId = _.lyra_id;
  const item = _.lyra_selected;
  const mode = _.lyra_mode;
  const role = item.mark.role;
  const itemId = tupleid(item);

  // If we've selected another scenegraph item or changed the manipulator state,
  // remove any manipulators we added here.
  if (cache.length && (cache._id !== itemId || cache._mode !== mode)) {
    out.rem = cache.splice(0);
  }

  // If we don't correspond to the current selection, early exit
  if (!role || (role && lyraId !== +role.split('lyra_')[1])) {
    return (out.source = this.value = cache, out);
  }

  // Manipulators should only be called on items that already exist
  // on the scenegraph. Fetch the currently selected scenegraph item.
  // TOO EXPENSIVE: assume that item is a valid scene graph element.
  // var item = input.mod.find(function(x) {
  //   return item && x._id === item._id;
  // });

  const tpls = this[mode](item).map(function(t) {
    t.mode = mode;
    t.lyra_id = lyraId;
    return t;
  });

  if (cache.length && cache._id === itemId) {
    tpls.forEach((d, i) => extend(cache[i], d));
    out.mod = cache;
  } else {
    cache._id = itemId;
    cache._mode = mode;
    cache.push.apply(cache, tpls.map(ingest));
    out.add = cache;
  }

  return (out.source = this.value = cache, out);
};

/**
 * Calculates the coordinates when in the `handles` manipulators mode.
 * @param  {Object} item - The Vega-Scenegraph Item corresponding to the
 * currently selected visualization mark instance.
 * @returns {Object[]} An array of objects, containing the coordinates and other
 * metadata for downstream manipulator mark specifications.
 */
prototype.handles = function(item) {
  return [];
};

/**
 * Calculates the coordinates when in the `connectors` manipulators mode.
 * @param  {Object} item - The Vega-Scenegraph Item corresponding to the
 * currently selected visualization mark instance.
 * @returns {Object[]} An array of objects, containing the coordinates and other
 * metadata for downstream manipulator mark specifications.
 */
prototype.connectors = function(item) {
  return [];
};

/**
 * Calculates the coordinates when in the `channels` manipulators mode.
 * @param  {Object} item - The Vega-Scenegraph Item corresponding to the
 * currently selected visualization mark instance.
 * @returns {Object[]} An array of objects, containing the coordinates and other
 * metadata for downstream manipulator mark specifications.
 */
prototype.channels = function(item) {
  return [];
};

/**
 * Calculates the coordinates when in the `altchannels` manipulators mode.
 * @param  {Object} item - The Vega-Scenegraph Item corresponding to the
 * currently selected visualization mark instance.
 * @returns {Object[]} An array of objects, containing the coordinates and other
 * metadata for downstream manipulator mark specifications.
 */
prototype.altchannels = function(item) {
  return [];
};
