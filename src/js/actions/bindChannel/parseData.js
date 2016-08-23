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
      input = parsed.input.encoding,
      groupByFieldName = '',
      aggFieldName = '',
      aggFieldSourceName = '',
      datasetAttr = {},
      aggSchema = {},
      groupby, sourceSchema, aggDsId;

  parsed.map.data.source = parsed.dsId;

  for (var k in input) {
    if (input.hasOwnProperty(k)) {
      if (input[k].hasOwnProperty('aggregate')) {
        aggFieldName = input[k].aggregate + '_' + input[k].field;
        aggFieldSourceName = input[k].field;
      }
    }
  }

  mappedOutput.data.forEach(function(dataItem, key) {
    if (dataItem.name === 'summary') {
      if (dataItem.transform) {
        dataItem.transform.forEach(function(transformItem) {

          if (transformItem.type === 'aggregate') {
            if (transformItem.groupby) {
              groupby = transformItem.groupby;

              sourceSchema = du.schema(du.input(dsId));
              groupByFieldName = groupby['0'];

              aggSchema[groupByFieldName] = sourceSchema[groupByFieldName];
              aggSchema[aggFieldName] = sourceSchema[aggFieldSourceName];

              datasetAttr.schema = aggSchema;
              datasetAttr.source = dsId;
              datasetAttr.name = aggFieldName;
              datasetAttr._parent = getInVis(state, 'datasets.' + dsId).toJS()._parent;
              datasetAttr.transform = transformItem;

              dispatch(aggregatePipeline(plId, groupby, datasetAttr));

              // need to retreive newly created dsId
              // parsed.map.data.summary = aggDsId;
            }
          }
        });
      }
    }
  });
}

module.exports = data;
