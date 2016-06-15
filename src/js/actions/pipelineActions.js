'use strict';

var CREATE_PIPELINE = 'CREATE_PIPELINE',
    UPDATE_PIPELINE_DATASET = 'UPDATE_PIPELINE_DATASET';

/**
 * Action creator to create a new Pipeline in the store
 *
 * @param {string} id - The string ID to use for this pipeline
 * @returns {object} A CREATE_PIPELINE action object
 */
function createPipeline(id) {
  return {
    type: CREATE_PIPELINE,
    id: id
  };
}

/**
 * Action creator to update a pipeline to use a Dataset class instance.
 * TODO: Move Datasets into the redux store as well.
 *
 * @param {number} pipelineId - The numeric ID of the pipeline to update
 * @param {number} datasetId - The numeric ID of the dataset with which to update
 * the pipeline
 * @returns {object} An UPDATE_PIPELINE_DATASET action object
 */
function updatePipelineDataset(pipelineId, datasetId) {
  return {
    type: UPDATE_PIPELINE_DATASET,
    pipelineId: pipelineId,
    datasetId: datasetId
  };
}

module.exports = {
  // Action Names
  CREATE_PIPELINE: CREATE_PIPELINE,
  UPDATE_PIPELINE_DATASET: UPDATE_PIPELINE_DATASET,

  // Action Creators
  createPipeline: createPipeline,
  updatePipelineDataset: updatePipelineDataset
};
