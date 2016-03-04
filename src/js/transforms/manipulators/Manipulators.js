'use strict';
var dl = require('datalib'),
    vg = require('vega'),
    inherits = require('inherits'),
    df = vg.dataflow,
    ChangeSet = df.ChangeSet,
    Tuple = df.Tuple,
    Deps = df.Dependencies,
    Transform = vg.Transform,
    Voronoi = vg.transforms.voronoi,
    sg = require('../../model/signals'),
    $x = dl.$('x'),
    $y = dl.$('y');

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
function Manipulators(graph) {
  Transform.prototype.init.call(this, graph);
  Transform.addParameters(this, {
    lyra_id: {type: 'value'}
  });

  this._cacheID = null;
  this._cacheMode = null;
  this._cache = [];
  this._voronoi = new Voronoi(graph);

  return this.router(true).produces(true)
    .dependency(Deps.SIGNALS, [sg.SELECTED, sg.MODE]);
}

inherits(Manipulators, Transform);

/**
 * The transform method is automatically called by Vega whenever the manipulator
 * coordinates need to be recalculated (e.g., when a new mark item is selected).
 * @param {Object} input - A Vega-Dataflow ChangeSet.
 * @return {Object} output - A Vega-Dataflow ChangeSet.
 */
Manipulators.prototype.transform = function(input) {
  var g = this._graph,
      item = g.signal(sg.SELECTED).value(),
      mode = g.signal(sg.MODE).value(),
      def = item.mark.def,
      lyra_id = this.param('lyra_id'),
      cache = this._cache,
      cacheID = this._cacheID,
      cacheMode = this._cacheMode,
      output = ChangeSet.create(input);

  // If we've selected another scenegraph item or changed the manipulator state,
  // remove any manipulators we added here.
  if (cache.length && (cacheID !== item._id || cacheMode !== mode)) {
    output.rem = cache.splice(0);
  }

  // If we don't correspond to the current selection, early exit
  if (!def || (def && lyra_id !== def.lyra_id)) {
    return output;
  }

  // Manipulators should only be called on items that already exist
  // on the scenegraph. Fetch the currently selected scenegraph item.
  // TOO EXPENSIVE: assume that item is a valid scene graph element.
  // var item = input.mod.find(function(x) {
  //   return item && x._id === item._id;
  // });

  var tpls = this[mode](item).map(function(t) {
    t.mode = mode;
    t.lyra_id = lyra_id;
    return t;
  });

  if (cache.length && cacheID === item._id) {
    tpls.forEach(function(d, i) { dl.extend(cache[i], d); });
    output.mod.push.apply(output.mod, cache);
  }
  else {
    this._cacheID = item._id;
    this._cacheMode = mode;
    cache.push.apply(cache, tpls.map(Tuple.ingest));
    output.add.push.apply(output.add, cache);
  }

  var clip = [
    [dl.min(cache, $x) - 100, dl.min(cache, $y) - 50],
    [dl.max(cache, $x) + 50, dl.max(cache, $y) + 50]
  ];

  return this._voronoi
    .param('x', 'x')
    .param('y', 'y')
    .param('clipExtent', clip)
    .batchTransform(output, cache);
};

/**
 * Calculates the coordinates when in the `handles` manipulators mode.
 * @param  {Object} item - The Vega-Scenegraph Item corresponding to the
 * currently selected visualization mark instance.
 * @return {Object[]} An array of objects, containing the coordinates and other
 * metadata for downstream manipulator mark specifications.
 */
Manipulators.prototype.handles = function(item) { return []; };

/**
 * Calculates the coordinates when in the `connectors` manipulators mode.
 * @param  {Object} item - The Vega-Scenegraph Item corresponding to the
 * currently selected visualization mark instance.
 * @return {Object[]} An array of objects, containing the coordinates and other
 * metadata for downstream manipulator mark specifications.
 */
Manipulators.prototype.connectors = function(item) { return []; };

/**
 * Calculates the coordinates when in the `channels` manipulators mode.
 * @param  {Object} item - The Vega-Scenegraph Item corresponding to the
 * currently selected visualization mark instance.
 * @return {Object[]} An array of objects, containing the coordinates and other
 * metadata for downstream manipulator mark specifications.
 */
Manipulators.prototype.channels = function(item) { return []; };

/**
 * Calculates the coordinates when in the `altchannels` manipulators mode.
 * @param  {Object} item - The Vega-Scenegraph Item corresponding to the
 * currently selected visualization mark instance.
 * @return {Object[]} An array of objects, containing the coordinates and other
 * metadata for downstream manipulator mark specifications.
 */
Manipulators.prototype.altchannels = function(item) { return []; };

module.exports = Manipulators;
