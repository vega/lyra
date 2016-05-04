'use strict';

var UPDATE_PIPELINE_DATASET = require('../constants/actions').UPDATE_PIPELINE_DATASET;

/**
 * Action creator to create a new Pipeline in the store
 */
module.exports = function(pipelineId, datasetId) {
  return {
    type: UPDATE_PIPELINE_DATASET,
    pipelineId: pipelineId,
    datasetId: datasetId
  };
};
