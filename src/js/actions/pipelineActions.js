'use strict';

var dl = require('datalib'),
    addDataset = require('./datasetActions').addDataset,
    counter = require('../util/counter'),
    getInVis = require('../util/immutable-utils').getInVis,
    dsUtil = require('../util/dataset-utils'),
    ADD_PIPELINE = 'ADD_PIPELINE',
    AGGREGATE_PIPELINE = 'AGGREGATE_PIPELINE',
    UPDATE_PIPELINE_PROPERTY = 'UPDATE_PIPELINE_PROPERTY';

/**
 * Action creator to add a new Pipeline in the store. A new pipeline requires
 * a new source dataset. Thus, we need to dispatch multiple actions.
 *
 * @param {Object} pipeline - The properties of the pipeline.
 * @param {Object} ds - The properties of the dataset.
 * @param {Array} values - A JSON array of parsed values.
 * @param {Object} schema - An object containing the schema values.
 * @returns {Function} An async action function
 */
function addPipeline(pipeline, ds, values, schema) {
  return function(dispatch) {
    var pid = pipeline._id || counter.global();

    ds = dl.extend({}, ds, {_parent: pid, name: pipeline.name + '_source'});
    ds = addDataset(ds, values, schema);
    dispatch(ds);

    pipeline = dl.extend({}, pipeline, {
      _id: pid,
      _source: pipeline._source || ds.id
    });

    dispatch({
      type: ADD_PIPELINE,
      id: pipeline._id,
      props: pipeline
    });
  };
}

/**
 * Action creator to aggregate a pipeline based on the given transform
 * definition. The action creator dispatches actions to create a new aggregated
 * dataset, and an action to associate this new dataset with the pipeline.
 *
 * @param   {number} id        The ID of the pipeline to aggregate
 * @param   {Object} aggregate A Vega aggregate transform definition.
 * @returns {Function}         An async action function.
 */
function aggregatePipeline(id, aggregate) {
  return function(dispatch, getState) {
    var state = getState(),
        pipeline = getInVis(state, 'pipelines.' + id),
        srcId = pipeline.get('_source'),
        srcSchema = getInVis(state, 'datasets.' + srcId + '._schema').toJS(),
        schema = dsUtil.aggregateSchema(srcSchema, aggregate),
        key = aggregate.groupby.join('|');

    var ds = addDataset({
      name: pipeline.get('name') + '_groupby_' + key,
      source: srcId,
      transform: [aggregate],
      _parent: id
    }, null, schema);

    dispatch(ds);
    dispatch({
      type: AGGREGATE_PIPELINE,
      id: id,
      dsId: (aggregate._id = ds.id),
      key: key
    });
  };
}

function updatePipelineProperty(id, property, value) {
  return {
    type: UPDATE_PIPELINE_PROPERTY,
    id: id,
    property: property,
    value: value
  };
}

module.exports = {
  // Action Names
  ADD_PIPELINE: ADD_PIPELINE,
  AGGREGATE_PIPELINE: AGGREGATE_PIPELINE,
  UPDATE_PIPELINE_PROPERTY: UPDATE_PIPELINE_PROPERTY,

  // Action Creators
  addPipeline: addPipeline,
  aggregatePipeline: aggregatePipeline,
  updatePipelineProperty: updatePipelineProperty
};
