'use strict';

var aggregatePipeline = require('../pipelineActions').aggregatePipeline,
    getInVis = require('../../util/immutable-utils').getInVis,
    du = require('../../util/dataset-utils');

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
function data(dispatch, state, parsed) {
  // TODO: transforms, aggregates, multiple datasets per pipeline, etc.
  var dsId = parsed.dsId,
      plId = getInVis(state, 'datasets.' + dsId + '._parent'),
      mappedOutput = parsed.output;

  parsed.map.data.source = parsed.dsId;
  findOrCreateAggregatePipeline(dispatch, state, mappedOutput, dsId, plId);
}

function findOrCreateAggregatePipeline(dispatch, state, output, dsId, pipelineId) {
  var groupby, datasetAttr = {};

  output.data.forEach(function(dataItem) {
    if (dataItem.name === 'summary') {
      if (dataItem.transform) {
        dataItem.transform.forEach(function(transformItem) {

          if (transformItem.type === 'aggregate') {
            if (transformItem.groupby) {
              groupby = transformItem.groupby;
              datasetAttr.props = getInVis(state, 'datasets.' + dsId).toJS();
              datasetAttr.values = du.input(dsId);
              datasetAttr.schema = du.schema(datasetAttr.values);
              datasetAttr.source = dsId;
              dispatch(aggregatePipeline(pipelineId, groupby, datasetAttr));
            }
          }
        });
      }
    }
  });
}

module.exports = data;
