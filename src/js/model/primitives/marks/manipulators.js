var dl = require('datalib'),
    sg = require('../../signals'),
    util = require('../../../util');

var TYPES = [];

// Vega specs for each of the manipulators type. We export a method
// that compiles them together within a group mark. This method 
// corresponds to the `manipulators` method of Mark classes. 
// Mode   = handles | connectors | channels | altchannels
// Manipulators = handle | connector | arrow | span | point
// This differentiation is needed because channels and altchannels
// display multiple manipulators. 
function manipulators(prototype) {

  prototype.manipulators = function() {
    return [this.export(false), {
      type: 'group',
      from: {
        mark: this.name, 
        transform: [
          {type: util.ns('manipulators_'+this.type), lyra_id: this._id},
          {type: 'facet', groupby: ['manipulator']}
        ]
      },
      marks: TYPES
    }];
  };

};

module.exports = manipulators;
manipulators.SIZES = {LARGE: 40, SMALL: 20};

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

TYPES.push(manipulators.HANDLE={
  type: 'symbol',
  from: {
    transform: [{type: 'filter', test: 'datum.manipulator === "handle"'}]
  },
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
});

TYPES.push(manipulators.CONNECTOR={
  type: 'group',
  from: {
    transform: [{type: 'filter', test: 'datum.manipulator === "connector"'}]
  },
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
});

TYPES.push(manipulators.ARROW={
  type: 'group',
  from: {
    transform: [
      {type: 'filter', test: 'datum.manipulator === "arrow"'},
      {type: 'facet', groupby: ['key']}
    ]
  },
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
});

TYPES.push(manipulators.SPAN=dl.extend({}, manipulators.ARROW, {
  from: {
    transform: [
      {type: 'filter', test: 'datum.manipulator === "span"'},
      {type: 'facet', groupby: ['key']}
    ]
  }
}));

manipulators.DROPZONE = {
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