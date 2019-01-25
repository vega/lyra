'use strict';

/**
 * A factory to produce a Lyra dataset. Each dataset corresponds to a single
 * definition of a data source in the resultant Vega specification. Pipelines,
 * on the other hand, may contain more than one dataset.
 *
 * @param {string} name  - The name of the dataset.
 * @param {Object} [opt] - An object to initialize the dataset's properties with.
 * @see  Vega's {@link https://github.com/vega/vega/wiki/Data|Data source}
 * documentation for more information on this class' "public" properties.
 *
 * @constructor
 */
module.exports = function(name, opt) {
  return {
    name:   name,
    source: opt ? opt.source : undefined,
    url: opt ? opt.url : undefined,
    format: opt ? opt.format : undefined
  };
};
