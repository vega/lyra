'use strict';
var dl = require('datalib'),
    inherits = require('inherits'),
    promisify = require('es6-promisify'),
    Primitive = require('../Primitive'),
    Field = require('./Field');

/**
 * @classdesc A Lyra Dataset Primitive.
 * @description  This class corresponds to a single definition of a data source
 * in Vega.
 * @extends {Primitive}
 *
 * @param {string} name - The name of the dataset.
 * @see  Vega's {@link https://github.com/vega/vega/wiki/Data|Data source}
 * documentation for more information on this class' "public" properties.
 *
 * @constructor
 */
function Dataset(name) {
  this.name = name;

  this.source = undefined;
  this.url = undefined;
  this.format = undefined;

  return Primitive.call(this);
}

inherits(Dataset, Primitive);

Dataset.prototype.init = function(opt) {
  var that = this;
  return new Promise(function(resolve, reject) {
    if (dl.isString(opt)) {
      resolve((that.source = opt, that));
    } else if (dl.isArray(opt)) {
      resolve((that._values = opt, that));
    } else {  // opt is an object
      that.format = opt.format;
      if (opt.values) {
        resolve((that._values = dl.read(opt.values, that.format), that));
      } else if (opt.url) {
        resolve(promisify(dl.load)({url: (that.url = opt.url)})
          .then(function(data) {
            that._vals = dl.read(data, that.format);
            return that;
          }));
      }
    }
  }).then(function(result) {
    return result.schema();
  });
};

/**
 * Gets the dataset's input tuples (i.e., prior to any transformations being
 * applied).
 * @returns {Object[]} An array of objects.
 */
Dataset.prototype.input = function() {
  return this._values || this._vals;
};

/**
 * Gets the dataset's output tuples (i.e., after all transformations have been
 * applied). This requires a visualization to have been parsed. If no
 * visualization has been parsed, returns the input tuples.
 * @returns {Object[]} An array of objects.
 */
Dataset.prototype.output = function() {
  var view = require('../../').view;
  return view ? view.data(this.name).values() : this.input();
};

/**
 * Gets the schema of the Dataset -- an object where the keys correspond to the
 * names of the dataset's fields, and the values are {@link Field|Field Primitives}.
 * @returns {Object} The Dataset's schema.
 */
Dataset.prototype.schema = function() {
  if (this._schema) {
    return this._schema;
  }
  var that = this,
      types = dl.type.inferAll(this.output());

  var schema = dl.keys(types).reduce(function(s, k) {
    s[k] = new Field(k, types[k]).parent(that._id);
    return s;
  }, {});

  return (this._schema = schema);
};

/**
 * Calculates a profile of summary statistics of every field in the Dataset.
 * @see  {@link https://github.com/vega/datalib/wiki/Statistics#dl_summary|datalib's}
 * documentation for more information.
 * @returns {Object} The Dataset's summary profile.
 */
Dataset.prototype.summary = function() {
  var s = this.schema();
  return dl.summary(this.output())
    .filter(function(p) {
      return p.field !== '_id';
    })
    .map(function(p) {
      return (s[p.field].profile(p), p);
    });
};

Dataset.prototype.export = function(resolve) {
  var spec = Primitive.prototype.export.call(this, resolve);
  if (this._values) {
    spec.values = this._values;
  } else if (this._vals && !resolve) {
    spec.values = this._vals;
    delete spec.url;
  }

  return spec;
};

module.exports = Dataset;
