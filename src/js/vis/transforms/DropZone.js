var dl = require('datalib'),
    vg = require('vega'),
    df = vg.dataflow,
    ChangeSet = df.ChangeSet,
    Tuple = df.Tuple,
    Deps = df.Dependencies,
    Transform = vg.transforms.Transform,
    sg = require('../../state/signals');

function DropZone(graph) {
  Transform.prototype.init.call(this, graph);

  this._cellID = null;
  this._cache  = [];
  this._start  = Tuple.ingest({});
  this._end    = Tuple.ingest({});
  return this.router(true).produces(true)
    .dependency(Deps.SIGNALS, [sg.CELL, sg.MOUSE]);
}

var prototype = (DropZone.prototype = Object.create(Transform.prototype));
prototype.constructor = DropZone;

prototype.transform = function(input) {
  var g = this._graph,
      cell  = g.signal(sg.CELL).value(),
      mouse = g.signal(sg.MOUSE).value(),
      cellID = this._cellID,
      cache  = this._cache,
      start  = this._start,
      end    = this._end,
      output = ChangeSet.create(input);

  if (cache.length && cellID !== cell._id) {
    output.rem = cache.splice(0);
  }

  if (!cell._id) {  
    return output;
  }

  // Voronoi cells always come after their manipulator. 
  var cousins = cell.cousin(-1).mark.items;

  // If we're still in the same cell, we only need to update
  // the mouse points. 
  if (cache.length) {
    output.mod.push(dl.extend(start, mouse));
    output.mod.push(dl.extend(end, mouse));
  } else {
    cache.push(dl.extend(start, mouse));

    // If backing data has coords, use those. Otherwise, use the cousin's bounds.
    if (dl.isValid(cousins[0].datum.x)) { 
      cache.push.apply(cache, cousins.map(function(i) { return i.datum; }));
    } else {
      cache.push.apply(cache, cousins.reduce(function(acc, i) {
        var b = i.bounds;
        return acc.concat([
          {x: b.x1, y: b.y1}, {x: b.x2, y: b.y1},
          {x: b.x1, y: b.y2}, {x: b.x2, y: b.y2}
        ].map(Tuple.ingest));
      }, []));
    }

    cache.push(dl.extend(end, mouse));
    output.add = cache;
    this._cellID = cell._id;
  }

  return output;
};

module.exports = DropZone;
