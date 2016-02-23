var dl = require('datalib'),
    sg = require('../../signals'),
    util = require('../../../util');

var TYPES = [];

// Mode = handles | connectors | channels | altchannels
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

manipulators.CONST = {
  LARGE: 40,
  SMALL: 20,
  PADDING: 7,
  STROKE_PADDING: 7,
  ARROWHEAD: 7
};

manipulators.size = function(b) {
  var c = this.CONST;
  return b.width() < c.SMALL || b.height() < c.SMALL ?
    c.SMALL : c.LARGE;
};

manipulators.coords = function(b, m) {
  var c = {
    topLeft:   {x: b.x1, y: b.y1, cursor: 'nw-resize'},
    topCenter: {x: b.x1 + (b.width()/2), y: b.y1, cursor: 'n-resize'},
    topRight:  {x: b.x2, y: b.y1, cursor: 'ne-resize'},
    midLeft:   {x: b.x1, y: b.y1 + (b.height()/2), cursor: 'w-resize'},
    midCenter: {x: b.x1 + (b.width()/2), y: b.y1 + (b.height()/2), cursor: 'move'},
    midRight:  {x: b.x2, y: b.y1 + (b.height()/2), cursor: 'e-resize'},
    bottomLeft:   {x: b.x1, y: b.y2, cursor: 'sw-resize'},
    bottomCenter: {x: b.x1 + (b.width()/2), y: b.y2, cursor: 's-resize'},
    bottomRight:  {x: b.x2, y: b.y2, cursor: 'se-resize'}
  };

  if (m) for (var k in c) {
    var d  = c[k];
    d.size = this.size(b);
    d.key  = k;
    d.manipulator = m;
  }

  return c;
};

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
    },
    hover: {
      cursor: {field: 'cursor'}
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