var dl = require('datalib'),
    Primitive = require('./Primitive'),
    model  = require('../'),
    lookup = model.primitive,
    names  = {};

function Scale(name, type, domain, range) {
  this.name = rename(name);
  this.type = type;

  // Literal domain/ranges. 
  this.domain = domain;
  this.range  = range;

  // DataRefs, which get compiled from id -> json
  // when exported.
  this._domain = [];
  this._range  = [];

  return Primitive.call(this);
}

var prototype = (Scale.prototype = Object.create(Primitive.prototype));
prototype.constructor = Scale;
prototype.parent = null;

// To prevent name collisions.
function rename(name) {
  var count = 0;
  while (names[name]) name += ++count;
  return (names[name] = 1, name);
}

// Exports FieldIDs to DataRefs. We don't default to the last option as the
// structure has performance implications in Vega. Most-least performant:
//   {"data": ..., "field": ...} for a single field
//   {"data": ..., "field": [...]} for multiple fields from the same dataset.
//   {"fields": [...]} for multiple fields from distinct datasets.
function fmap(f) { return f._name; }

function dataRef(ref) {
  var sets = {},
      data, field, i, len, keys, fields;

  if (ref.length === 1 && (ref=ref[0])) {
    field = lookup(ref);
    return {data: field.parent().name, field: field._name};
  } else {
    for (i=0, len=ref.length; i<len; ++i) {
      field = lookup(ref[i]);
      data  = field.parent();
      sets[data._id] = sets[data._id] || (sets[data._id] = []);
      sets[data._id].push(field);
    }

    keys = dl.keys(sets);
    if (keys.length === 1) {
      ref = {
        data: data.name,
        field: sets[data._id].map(fmap)
      };
    } else {
      ref = {fields: []};
      for (i=0, len=keys.length; i<len; ++i) {
        data = lookup(keys[i]);
        ref.fields.push({
          data: data.name,
          field: sets[data._id].map(fmap)
        });
      }
    }
  }
}

prototype.export = prototype.manipulators = function(resolve) {
  var spec = Primitive.prototype.export.call(this, resolve);

  if (!this.domain && this._domain.length) {
    spec.domain = dataRef(this._domain);
  }

  if (!this.range && this._range.length) {
    spec.range = dataRef(this._range);
  }

  return spec;
};

module.exports = Scale;