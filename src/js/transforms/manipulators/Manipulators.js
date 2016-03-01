'use strict';
var dl = require('datalib'),
    vg = require('vega'),
    df = vg.dataflow,
    ChangeSet = df.ChangeSet,
    Tuple = df.Tuple,
    Deps = df.Dependencies,
    Transform = vg.Transform,
    Voronoi = vg.transforms.voronoi,
    sg = require('../../model/signals'),
    $x = dl.$('x'),
    $y = dl.$('y');

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

var prototype = (Manipulators.prototype = Object.create(Transform.prototype));
prototype.constructor = Manipulators;

prototype.transform = function(input) {
  var self = this,
      g = this._graph,
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

prototype.handles = function(item) { return []; };
prototype.connectors = function(item) { return []; };
prototype.channels = function(item) { return []; };
prototype.altchannels = function(item) { return []; };

module.exports = Manipulators;
