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
      mappedOutput = parsed.output,
      groupby, datasetAttr = {};

  parsed.map.data.source = parsed.dsId;

  console.log('parsed: ', parsed);

  mappedOutput.data.forEach(function(dataItem, key) {
    if (dataItem.name === 'summary') {
      console.log('dataItem, key: ', dataItem, key);
      parsed.map.data.summary = key;
      if (dataItem.transform) {
        dataItem.transform.forEach(function(transformItem) {

          if (transformItem.type === 'aggregate') {
            if (transformItem.groupby) {
              groupby = transformItem.groupby;

              datasetAttr.props = getInVis(state, 'datasets.' + dsId).toJS();
              datasetAttr.schema = du.schema(du.input(dsId));
              datasetAttr.source = dsId;

              dispatch(aggregatePipeline(plId, groupby, datasetAttr));
            }
          }
        });
      }
    }
  });
}

module.exports = data;
