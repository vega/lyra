var inherits = require('inherits'),
    Primitive = require('../Primitive'),
    Dataset = require('./Dataset');

/**
 * @classdesc A Lyra Pipeline Primitive.
 * @description  This class does not have a corresponding Vega definition.
 * A Pipeline comprises several related Datasets (that may be grouped together
 * in the Lyra UI).
 *
 * @param {string} name - The name of the pipeline
 *
 * @property {Object} _source - The source {@link Dataset} of the pipeline. All
 * other {@link Dataset|Datasets} in the pipeline must be derived from this.
 * @property {Object[]} _aggregates TBD - Possible an array of derived Datasets
 * to compute aggregation?
 *
 * @constructor
 */
function Pipeline(name) {
  Primitive.call(this);
  this.name = name;
  this._source = new Dataset(name).parent(this._id);
  this._aggregates = [];
  return this;
}

inherits(Pipeline, Primitive);
Pipeline.prototype.parent = null;

/**
 * Exports each of the constituent {@link Dataset|Datasets}.
 * @param  {boolean} [clean=true] - Should Lyra-specific properties be removed
 * or resolved (e.g., converting property signal references to actual values).
 * @return {Object[]} An array of Vega data source specifications.
 */
Pipeline.prototype.export = function(clean) {
  return [this._source.export(clean)]
    .concat(this._aggregates.map(function(a) { return a.export(clean); }));
};

module.exports = Pipeline;
