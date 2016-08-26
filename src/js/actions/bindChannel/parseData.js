'use strict';

var aggregatePipeline = require('../pipelineActions').aggregatePipeline,
    addToSummarizes = require('../datasetActions').addToSummarize,
    getInVis = require('../../util/immutable-utils').getInVis,
    dl = require('datalib'),
    du = require('../../util/dataset-utils'),
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
      map = parsed.map,
      summary = map.data.summary,
      sourceBacking = {},
      aggregatedDataset, pl, plAggsProps, aggDsGroupby;

  parsed.map.data.source = parsed.dsId;

  // if a matching aggregate ds is found
  if (summary) {
    aggregatedDataset = getInVis(state, 'datasets.' + summary);

    if (aggregatedDataset) {
      // grab pipeline from plId which is derived from dsId
      pl = getInVis(state, 'pipelines.' + plId);
      plAggsProps = dl.keys(pl.get('_aggregates').toJS());
      aggDsGroupby = aggregatedDataset.get('transform').toJS()[0].groupby[0];

      if (plAggsProps.indexOf(aggDsGroupby) !== -1) {
        // matching groupbys
        // construct summarize and add trigger dispatch
        var backingDef = aggregateDef(parsed.input),
            summarize = {
              field: backingDef.aggFieldSourceName,
              aggOp: backingDef.aggregate
            };

        // dispatch updateSummarize with id property
        dispatch(addToSummarizes(summary, summarize));
      }
    }
  } else {
    sourceBacking.sourceDs = getInVis(state, 'datasets.' + dsId);
    sourceBacking.sourceSchema = du.schema(du.input(dsId));
    sourceBacking.plId = plId;

    createAggregateDataset(dispatch, parsed, sourceBacking);
  }
}

function createAggregateDataset(dispatch, parsed, sourceBacking) {
  var dsId = parsed.dsId,
      input = parsed.input,
      output = parsed.output,
      sourceDs = sourceBacking.sourceDs,
      sourceSchema = sourceBacking.sourceSchema,
      plId = sourceBacking.plId,
      aggSchema = {},
      datasetAttr = {},
      groupby,
      groupByFieldName,
      aggDsName,
      aggrDef = {};

  aggrDef = aggregateDef(input);

  output.data.forEach(function(dataItem, key) {
    if (dataItem.name === 'summary') {
      if (dataItem.transform) {
        var transformItem = dataItem.transform[0];
        if (transformItem.type === 'aggregate') {
          // code for all aggregation
          if (transformItem.groupby) {
            // code for adding aggregated ds
            groupby = transformItem.groupby;

            // construct aggregated dataset schema
            groupByFieldName = groupby[0];
            aggSchema[groupByFieldName] = sourceSchema[groupByFieldName];
            aggSchema[aggrDef.aggFieldName] = sourceSchema[aggrDef.aggFieldSourceName];

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
}

function aggregateDef(input) {
  var encoding = input.encoding,
      def = {};

  for (var k in encoding) {
    if (encoding.hasOwnProperty(k)) {
      if (encoding[k].hasOwnProperty('aggregate')) {
        def.aggregate = encoding[k].aggregate;
        def.field = encoding[k].field;
        def.aggFieldName = def.aggregate + '_' + def.field;
        def.aggFieldSourceName = def.field;
      }
    }
  }

  return def;
}

module.exports = data;
