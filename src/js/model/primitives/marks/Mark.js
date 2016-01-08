var dl = require('datalib'),
    sg = require('../../signals'),
    Primitive = require('../Primitive'),
    manips = require('./manipulators'),
    rules  = require('../../rules'),
    util   = require('../../../util'),
    model  = require('../../'),
    lookup = model.primitive,
    count  = {group: -1};

function Mark(type) {
  var cnt   = count[type] || (count[type] = 0);
  this.name = type+'_'+(++count[type]);
  this.type = type;
  this.from = undefined;

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

  this._rule = new rules.VLSingle(type);

  return Primitive.call(this);
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
      from = this.from && lookup(this.from),
      keys = dl.keys(update),
      k, v, i, len, s, f;

  if (from) {
    spec.from = (from instanceof Mark) ? {mark: from.name} :
      {data: from.name};
  }

  for (i=0, len=keys.length; i<len; ++i) {
    v = update[k=keys[i]];
    if (!dl.isObject(v)) {  // signalRef resolved to literal
      update[k] = {value: v};
    }

    if (v.scale) v.scale = (s=lookup(v.scale)) && s.name;
    if (v.field) v.field = (f=lookup(v.field)) && f._name;
  }

  if (!resolve) {
    spec.lyra_id = this._id;
  }

  return spec;
};

manips(prototype);
rules(prototype);

module.exports = Mark;