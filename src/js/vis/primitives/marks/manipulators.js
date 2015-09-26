var dl = require('datalib');

// Vega specs for each of the manipulators type. We export a method
// that compiles them together within a group mark. This method 
// corresponds to the `manipulators` method of Mark classes. 
function compile(manipulators) {
  var mark  = this,
      marks = [mark.export(false)];
  
  marks = marks.concat((manipulators||[]).map(function(m) {
    var k = m.kind, n = mark.name;
    var transforms =[{
      type: 'lyra_manipulators_'+mark.type,
      name: n,
      kind: k
    }];

    if (m.type === 'group' && (k === 'arrows' || k === 'spans')) {
      transforms.push({ type: 'facet', groupby: ['key'] });
    }

    return dl.extend(m, {
      from: {mark: n, transform: transforms}
    });
  }));

  return {
    type: 'group',
    properties: {
      update: {
        x: {value: 0},
        y: {value: 0},
        width: {field: {group: 'width'}},
        height: {field: {group: 'height'}}
      }
    },
    marks: marks
  };
}

module.exports = compile;

compile.SIZES = {LARGE: 40, SMALL: 20};

compile.VORONOI = function(path) {
  return {
    type: 'path',
    name: 'cell',
    properties: {
      update: {
        fill: {value: 'transparent'},
        strokeWidth: {value: 0.35},
        path: {field: path || 'layout_path'},
        stroke: {value: 'brown'}
      }
    }
  };
}

compile.HANDLES = {
  kind: 'handles',
  type: 'symbol',
  properties: {
    update: {
      x: {field: 'x'},
      y: {field: 'y'},
      shape: {value: 'square'},
      size: {field: 'size'},
      fill: {value: 'white'},
      stroke: {value: 'black'},
      strokeWidth: {value: 0.5}
    }
  }
};

compile.CONNECTORS = {
  kind: 'connectors',
  type: 'group',
  marks: [{
    type: 'symbol',
    properties: {
      update: {
        x: {field: {parent: 'x'}},
        y: {field: {parent: 'y'}},
        shape: {value: 'diamond'},
        size: {field: {parent: 'size'}},
        fill: {value: 'white'},
        stroke: {value: 'magenta'},
        strokeWidth: {value: 0.5}
      }
    }
  }, compile.VORONOI({parent: 'layout_path'})]
};

compile.ARROWS = {
  kind: 'arrows',
  type: 'group',
  marks: [{
    type: 'line',
    properties: {
      update: {
        x: {field: 'x'},
        y: {field: 'y'},
        fill: {value: 'cyan'},
        stroke: {value: 'cyan'},
        strokeWidth: {value: 3}
      }
    }
  }, compile.VORONOI()]
};

compile.SPANS = dl.extend({}, compile.ARROWS, {kind: 'spans'});