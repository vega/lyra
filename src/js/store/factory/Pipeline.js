'use strict';

/**
 * A factory to produce a Lyra pipeline. Pipelines group together a single
 * source dataset with additional derived datasets (e.g., aggregates or facets).
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
module.exports = function(name) {
  return {
    name: name,
    _source: undefined,
    _aggregates: {}
  };
};
