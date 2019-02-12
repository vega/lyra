'use strict';

const aggregatePipeline   = require('../pipelineActions').aggregatePipeline,
    getInVis = require('../../util/immutable-utils').getInVis;

import {LyraAggregateTransform} from '../../store/factory/Pipeline';
import {summarizeAggregate} from '../datasetActions';

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
  const data = parsed.output.data,
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
  const aggregate: LyraAggregateTransform = summary.transform.find(function(tx) {
    return tx.type === 'aggregate';
  });

  const groupby = aggregate.groupby as string[]; // TODO vega 2 groupby was string[]
  const keys  = groupby.join('|');
  const plId  = parsed.plId;
  let aggId = getInVis(state, 'pipelines.' + plId + '._aggregates.' + keys);

  if (!aggId) {
    // TODO: What about if a previous parsed.map.data.summary exists? How do
    // we derive a new agg DS to preserve transforms.
    dispatch(aggregatePipeline(plId, aggregate));
    aggId = aggregate._id;
  } else {
    dispatch(summarizeAggregate(aggregate, aggId));
  }

  parsed.map.data.summary = aggId;
}
