var dl = require('datalib'),
    sg = require('../../../state/signals');

// Vega specs for each of the manipulators type. We export a method
// that compiles them together within a group mark. This method 
// corresponds to the `manipulators` method of Mark classes. 
function compile(manipulators) {
  manipulators = dl.array(manipulators);
  return function() {
    var mark  = this,
        marks = [mark.export(false)];
    
    marks.push.apply(marks, manipulators.map(function(m) {
      var k = m.kind, n = mark.name;
      var transforms =[{
        type: sg.ns('manipulators_'+mark.type),
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
}

module.exports = compile;

function voronoi(parent) {
  return {
    type: 'path',
    name: sg.CELL,
    properties: {
      update: {
        key: {field: parent ? {parent: 'key'} : 'key'},
        fill: {value: 'transparent'},
        strokeWidth: {value: 0.35},
        path: {field: parent ? {parent: 'layout_path'} : 'layout_path'},
        stroke: {value: 'transparent'}
      }
    }
  };
}

function hoverCell(t, f, parent) {
  var rule = [{
    predicate: {
      name: sg.CELL, 
      key: {field: parent ? {parent: 'key'} : 'key'}
    }
  }];

  dl.extend(rule[0], t);
  rule.push(f);
  return {rule: rule};
}

compile.SIZES = {LARGE: 40, SMALL: 20};

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
        stroke: hoverCell({value: 'lightsalmon'}, {value: 'cyan'}, true),
        strokeWidth: {value: 0.5}
      }
    }
  }, voronoi(true)]
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
        fill: hoverCell({value: 'lightsalmon'}, {value: 'cyan'}),
        stroke: hoverCell({value: 'lightsalmon'}, {value: 'cyan'}),
        strokeWidth: {value: 3}
      }
    }
  }, voronoi()]
};

compile.SPANS = dl.extend({}, compile.ARROWS, {kind: 'spans'});

compile.DROPZONE = {
  type: 'line',
  from: {data: 'dropzone'},
  properties: {
    update: {
      x: {field: 'x'},
      y: {field: 'y'},
      fill: {value: 'lightsalmon'},
      fillOpacity: {value: 0.2}
    }
  }
};