'use strict';

var aggregatePipeline = require('../pipelineActions').aggregatePipeline,
    getInVis = require('../../util/immutable-utils').getInVis,
    du = require('../../util/dataset-utils'),
    dl = require('datalib'),
    counter = require('../../util/counter');

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
      aggDsName = '',
      datasetAttr = {},
      aggSchema = {},
      groupby, sourceSchema, sourceDs;

  parsed.map.data.source = parsed.dsId;

  console.log('parsed: ', parsed);

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
        var transformItem = dataItem.transform[0];

        if (transformItem.type === 'aggregate') {
          if (transformItem.groupby) {
            // source ds and schema backing creation of new schema & aggregated
            // dataset
            sourceDs = getInVis(state, 'datasets.' + dsId);
            sourceSchema = du.schema(du.input(dsId));

            groupby = transformItem.groupby;

            // construct aggregated dataset schema
            groupByFieldName = groupby[0];
            aggSchema[groupByFieldName] = sourceSchema[groupByFieldName];
            aggSchema[aggFieldName] = sourceSchema[aggFieldSourceName];

            // aggregated dataset properties
            aggDsName = sourceDs.get('name') + '_groupby_' + groupby.join('');

            datasetAttr.schema = aggSchema;
            datasetAttr.source = dsId;
            datasetAttr.name = aggDsName;
            datasetAttr._id = counter.global();
            datasetAttr._parent = sourceDs.get('_parent');
            datasetAttr.transform = [transformItem];

            var aggPipeline = aggregatePipeline(plId, groupby, datasetAttr);
            dispatch(aggPipeline);
            // store newly created aggregate dataset id
            parsed.map.data.summary = datasetAttr._id;
          }
        }
      }
    }
  });

  console.log('parsed: ', parsed);
}

module.exports = data;
