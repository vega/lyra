var dl = require('datalib'),
    vg = require('vega'),
    df = vg.dataflow,
    ChangeSet = df.ChangeSet,
    Tuple = df.Tuple,
    Deps = df.Dependencies,
    Transform = vg.transforms.Transform,
    sg = require('../../state/signals');    

function Manipulators(graph) {
  Transform.prototype.init.call(this, graph);
  Transform.addParameters(this, {
    name: {type: 'value'},
    kind: {type: 'value'}
  });

  this._cacheID = null;
  this._cache   = [];

  return this.router(true).produces(true)
    .dependency(Deps.SIGNALS, [sg.SELECTED, sg.MANIPULATORS]);
}

var prototype = (Manipulators.prototype = Object.create(Transform.prototype));
prototype.constructor = Manipulators;

prototype.transform = function(input) {
  var self = this,
      g = this._graph,
      sel = g.signal(sg.SELECTED).value(),
      manip = g.signal(sg.MANIPULATORS).value(),
      name = this.param('name'),
      kind = this.param('kind'),
      cache   = this._cache,
      cacheID = this._cacheID,
      output = ChangeSet.create(input);

  // If we've selected another scenegraph item or changed the manipulator state, 
  // remove any manipulators we added here.
  if (cache.length && (cacheID !== sel._id || kind !== manip)) {
    output.rem = cache.splice(0);
  }

  // If we don't correspond to the current selection, early exit
  if ((sel && name !== sel.mark.name) || kind !== manip) {
    return output;
  }

  // Manipulators should only be called on items that already exist
  // on the scenegraph. Fetch the currently selected scenegraph item.
  var item = input.mod.filter(function(x) {
    return sel && x._id === sel._id;
  })[0];

  var tpls = this[kind](item).map(function(t) {
    t.name = name;
    t.kind = kind;
    return t;
  });

  if (cache.length && cacheID === item._id) {
    tpls.forEach(function(d, i) { dl.extend(cache[i], d); });
    output.mod.push.apply(output.mod, cache);
  } else {
    this._cacheID = item._id;
    cache.push.apply(cache, tpls.map(Tuple.ingest));
    output.add.push.apply(output.add, cache);
  }

  return output;
};

prototype.handles = function(item) { return []; };

module.exports = Manipulators;