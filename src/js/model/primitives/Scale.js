'use strict';
var dl = require('datalib'),
    inherits = require('inherits'),
    Primitive = require('./Primitive'),
    model = require('../'),
    lookup = model.lookup,
    names = {};

// To prevent name collisions.
function rename(name) {
  var count = 0;
  while (names[name]) {
    name += ++count;
  }
  return (names[name] = 1, name);
}

/**
 * @classdesc A Lyra Scale Primitive.
 *
 * @description The Scale Primitive corresponds to a definition for a Vega scale.
 * @extends {Primitive}
 *
 * @param {string} name - The initial name of the scale. It may be renamed to
 * prevent scale name collisions.
 * @param {string} type - The scale type (e.g., `ordinal`, `linear`, etc.).
 * @param {*} domain - The scale domain (values in data space).
 * @param {*} range - The scale range (values in visual space, e.g., `width`).
 *
 * @property {number[]} _domain - An array of primitive IDs if the scale's
 * domain is a set of fields (a Vega {@link https://github.com/vega/vega/wiki/Scales#scale-domains|DataRef}).
 * @property {number[]} _range - An array of primitive IDs if the scale's
 * range is a set of fields (a Vega {@link https://github.com/vega/vega/wiki/Scales#scale-domains|DataRef}).
 * @see Vega's {@link https://github.com/vega/vega/wiki/Scales|Scales}
 * documentation for more information on this class' "public" properties.
 *
 * @constructor
 */
function Scale(name, type, domain, range) {
  this.name = rename(name);
  this.type = type;

  // Literal domain/ranges.
  this.domain = domain;
  this.range = range;

  // DataRefs, which get compiled from id -> json
  // when exported.
  this._domain = [];
  this._range = [];

  return Primitive.call(this);
}

inherits(Scale, Primitive);
Scale.prototype.parent = null;

// Exports FieldIDs to DataRefs. We don't default to the last option as the
// structure has performance implications in Vega. Most-least performant:
//   {"data": ..., "field": ...} for a single field
//   {"data": ..., "field": [...]} for multiple fields from the same dataset.
//   {"fields": [...]} for multiple fields from distinct datasets.
function fmap(f) {
  return f._name;
}

function dataRef(ref) {
  var sets = {},
      data, field, i, len, keys;

  // One ref
  if (ref.length === 1 && (ref = ref[0])) {
    field = lookup(ref);
    return {data: field.parent().name, field: field._name};
  }

  // More than one ref
  for (i = 0, len = ref.length; i < len; ++i) {
    field = lookup(ref[i]);
    data = field.parent();
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
    for (i = 0, len = keys.length; i < len; ++i) {
      data = lookup(keys[i]);
      ref.fields.push({
        data: data.name,
        field: sets[data._id].map(fmap)
      });
    }
  }
}

Scale.prototype.export = Scale.prototype.manipulators = function(resolve) {
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
