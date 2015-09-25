var dl = require('datalib'),
    sg = require('../../../state/signals'),
    Primitive = require('../Primitive'),
    util = require('../../../util'),
    markID = 0;

function Mark(type) {
  this.name = type+'_'+(++markID);
  this.type = type;
  this.from = {};

  this.properties = {
    update: {
      x: {value: 25},
      y: {value: 25},
      fill: {value: '#4682b4'},
      fillOpacity: {value: 1},
      stroke: {value: '#000000'},
      strokeWidth: {value: 0.25}
    }
  };

  return this;
}

var prototype = (Mark.prototype = Object.create(Primitive.prototype));
prototype.constructor = Mark;

// Convert all registered visual properties w/literal values to signals.
// Subclasses will register the necessary streams to change the signal values.
prototype.init = function() {
  var props  = this.properties,
      update = props.update,
      k, p;

  for (k in update) {
    p = update[k];
    if (p.value !== undefined) {
      update[k] = dl.extend(sg.init(util.propSg(this, k), p.value),
        p._disabled ? {_disabled: true} : {});
    }
  }

  this.handles();

  return this;
};

// Convert signalRefs to valueRefs unless resolve === false.
prototype.export = function(resolve) {
  var spec = Primitive.prototype.export.call(this, resolve),
      props  = spec.properties,
      update = props.update,
      k, v;

  if (resolve === false) return spec;
  for (k in update) {
    if (!dl.isObject(v=update[k])) {
      update[k] = {value: v};
    }
  }

  return spec;
};

// Vega spec that includes the current mark + its manipulators. We
// group them together within a group mark to keep things clean.
var MANIPULATORS = [{
  kind: 'handles',
  properties: {
    update: {
      x: {field: 'x'},
      y: {field: 'y'},
      shape: {value: 'square'},
      size: {value: 40},
      fill: {value: 'white'},
      stroke: {value: 'black'},
      strokeWidth: {value: 0.5}
    }
  }
}];

prototype.manipulators = function() {
  var self  = this;
  var marks = [this.export(false)]
    .concat(MANIPULATORS.map(function(m) {
      return {
        type: 'symbol',
        from: {
          mark: self.name,
          transform: [{
            type: 'lyra.Manipulators.'+self.type,
            name: self.name,
            kind: m.kind
          }]
        },
        properties: m.properties
      };
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
};

// Interaction logic for handle manipulators.
prototype.handles = function() {};

module.exports = Mark;