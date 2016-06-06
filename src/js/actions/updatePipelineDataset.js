'use strict';

var UPDATE_PIPELINE_DATASET = require('../constants/actions').UPDATE_PIPELINE_DATASET;

/**
 * Action creator to update a pipeline to use a Dataset class instance.
 * TODO: Move Datasets into the redux store as well.
 *
 * @param {number} pipelineId - The numeric ID of the pipeline to update
 * @param {number} datasetId - The numeric ID of the dataset with which to update
 * the pipeline
 * @returns {object} An UPDATE_PIPELINE_DATASET action object
 */
module.exports = function(pipelineId, datasetId) {
  return {
    type: UPDATE_PIPELINE_DATASET,
    pipelineId: pipelineId,
    datasetId: datasetId
  };
};
