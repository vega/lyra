var vg = require('vega'),
    df = vg.dataflow,
    ChangeSet = df.ChangeSet,
    Tuple = df.Tuple,
    Deps = df.Dependencies,
    Transform = vg.transforms.Transform;    

function Manipulators(graph) {
  Transform.prototype.init.call(this, graph);
  Transform.addParameters(this, {
    name: {type: 'value'},
    kind: {type: 'value'}
  });

  this._cacheID  = null;
  this._cache    = [];

  return this.router(true).produces(true)
    .dependency(Deps.SIGNALS, ['lyra.selected', 'lyra.manipulators']);
}

var prototype = (Manipulators.prototype = Object.create(Transform.prototype));
prototype.constructor = Manipulators;

prototype.transform = function(input) {
  var self = this,
      g = this._graph,
      sel = g.signal('lyra.selected').value(),
      manip = g.signal('lyra.manipulators').value(),
      name = this.param('name'),
      kind = this.param('kind'),
      output = ChangeSet.create(input),
      i, len, x;

  // If we've selected another scene graph item or changed the manipulator state, 
  // remove any manipulators we added here.
  if (this._cache.length && (this._cacheID !== sel._id || kind !== manip)) {
    output.rem = this._cache.splice(0);
  }

  // If we don't correspond to the current selection, early exit
  if ((sel && name !== sel.mark.name) || kind !== manip) {
    return output;
  }

  // Manipulators should only be called on items that already exist
  // on the scenegraph. 
  var items = input.mod,
      out   = output.add,
      x, i, len;


  for (i=0, len=items.length, x; i<len; ++i) {
    x = items[i];
    if (sel && x._id !== sel._id) continue;

    this._cacheID = x._id;
    this._cache = this[kind](x).map(Tuple.ingest);
    out.push.apply(out, this._cache);
    break;
  }

  return output;
};

prototype.handles = function(item) { return []; };

module.exports = Manipulators;