'use strict';

var aggregatePipeline  = require('../pipelineActions').aggregatePipeline,
    summarizeAggregate = require('../datasetActions').summarizeAggregate,
    getInVis = require('../../util/immutable-utils').getInVis;

/**
 * Parse the data source definitions in the resultant Vega specification.
 * For now, as we do not yet support transforms, we only add an entry to the
 * `map` to identify the data source named "source" as our backing Lyra
 * dataset.
 *
 * @param {Function} dispatch  Redux dispatch function.
 * @param {ImmutableMap} state Redux store.
 * @param {Object} parsed      An object containing the parsed and output Vega
 * specifications as well as a mapping of output spec names to Lyra IDs.
 * @param {number} dsId        The ID of the current mark's backing dataset.
 * @returns {void}
 */
module.exports = function(dispatch, state, parsed) {
  // TODO: transforms.
  var data = parsed.output.data,
      source = data.find(function(def) {
        return def.name === 'source';
      }),
      summary = data.find(function(def) {
        return def.name === 'summary';
      });

  parsed.map.data.source = parsed.dsId;

  if (summary) {
    parseAggregate(dispatch, state, parsed, summary);
  }
};

function parseAggregate(dispatch, state, parsed, summary) {
  var aggregate = summary.transform.find(function(tx) {
    return tx.type === 'aggregate';
  });

  var groupby = aggregate.groupby,
      keys  = groupby.join('|'),
      plId  = parsed.plId,
      aggId = getInVis(state, 'pipelines.' + plId + '._aggregates.' + keys);

  if (!aggId) {
    dispatch(aggregatePipeline(plId, aggregate));
    aggId = aggregate._id;
  } else {
    dispatch(summarizeAggregate(aggId, aggregate.summarize));
  }

  parsed.map.data.summary = aggId;
}
