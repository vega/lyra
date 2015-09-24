var dl = require('datalib'),
    sg = require('../../../state/signals'),
    Primitive = require('../Primitive'),
    markID = 0;

function Mark(type) {
  this.name = type+'_'+(++markID);
  this.type = type;
  this.from = {};

  this.properties = {
    enter: {
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
prototype.init = function() {
  var props = this.properties,
      enter = props.enter,
      k, p;

  for (k in enter) {
    p = enter[k];
    if (p.value !== undefined) enter[k] = sg.def(this.name+'_'+k, p.value);
    if (p._disabled) enter[k]._disabled = true;
  }

  return this;
};

// Convert signalRefs to valueRefs unless resolve === false.
prototype.export = function(resolve) {
  var spec  = Primitive.prototype.export.call(this, resolve),
      props = spec.properties,
      enter = props.enter;

  if (resolve === false) return spec;
  for (var k in enter) {
    if (!dl.isObject(enter[k])) enter[k] = {value: enter[k]};
  }

  return spec;
};

// Vega spec that includes the current mark + its manipulators. We
// group them together within a group mark to keep things clean.
var MANIPULATORS = [{
  kind: 'handles',
  properties: {
    enter: {
      shape: {value: 'square'},
      stroke: {value: 'black'},
      strokeWidth: {value: 0.5}
    },
    update: {
      x: {field: 'x'},
      y: {field: 'y'},
      size: {value: 40},
      fill: {value: 'white'}
    }
  }
}];

prototype.manipulators = function() {
  var self = this, marks = [this.export(false)]
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
      enter: {
        x: {value: 0},
        y: {value: 0},
        width: {field: {group: 'width'}},
        height: {field: {group: 'height'}}
      }
    },
    marks: marks
  };
};

module.exports = Mark;