'use strict';

var UPDATE_PIPELINE_DATASET = require('../constants/actions').UPDATE_PIPELINE_DATASET;

/**
 * Action creator to update a pipeline to use a Dataset class instance.
 * TODO: Move Datasets into the redux store as well.
 */
module.exports = function(pipelineId, datasetId) {
  return {
    type: UPDATE_PIPELINE_DATASET,
    pipelineId: pipelineId,
    datasetId: datasetId
  };
};
