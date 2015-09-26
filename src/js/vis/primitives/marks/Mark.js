var dl = require('datalib'),
    sg = require('../../../state/signals'),
    Primitive = require('../Primitive'),
    manips = require('./manipulators'),
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

  this.initHandles();

  return this;
};

// Interaction logic for handle manipulators.
prototype.initHandles = function() {};

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

prototype.manipulators = function(types) {
  return manips.call(this, types || [manips.HANDLES]);
};

module.exports = Mark;