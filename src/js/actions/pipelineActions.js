'use strict';

var dl = require('datalib'),
    counter = require('../util/counter'),
    datasetActions = require('./datasetActions'),
    addDataset = datasetActions.addDataset,
    ADD_PIPELINE = 'ADD_PIPELINE',
    UPDATE_PIPELINE_PROPERTY = 'UPDATE_PIPELINE_PROPERTY',
    SHOW_EXPRESSION_TEXTBOX = 'SHOW_EXPRESSION_TEXTBOX';

/**
 * Action creator to add a new Pipeline in the store. A new pipeline requires
 * a new source dataset. Thus, we need to dispatch multiple actions.
 *
 * @param {Object} pipeline - The properties of the pipeline.
 * @param {Object} dataset - The properties of the dataset.
 * @param {Array} values - A JSON array of parsed values.
 * @param {Object} schema - An object containing the schema values.
 * @returns {Function} An async action function
 */
function addPipeline(pipeline, dataset, values, schema) {
  return function(dispatch) {
    var pid = pipeline._id || counter.global();

    var ds = addDataset(dl.extend({_parent: pid}, dataset), values, schema);
    dispatch(ds);

    pipeline = dl.extend({
      _id: pid,
      _source: pipeline._source || ds.id
    }, pipeline);

    dispatch({
      type: ADD_PIPELINE,
      id: pipeline._id,
      props: pipeline
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

function showExpressionTextbox(dsId, show, time) {
  return {
    type: SHOW_EXPRESSION_TEXTBOX,
    id: dsId,
    show: show,
    time: time
  };
}

module.exports = {
  // Action Names
  ADD_PIPELINE: ADD_PIPELINE,
  UPDATE_PIPELINE_PROPERTY: UPDATE_PIPELINE_PROPERTY,
  SHOW_EXPRESSION_TEXTBOX: SHOW_EXPRESSION_TEXTBOX,

  // Action Creators
  addPipeline: addPipeline,
  updatePipelineProperty: updatePipelineProperty,
  showExpressionTextbox: showExpressionTextbox
};
