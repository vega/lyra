'use strict';
var SELECT_PIPELINE = require('../constants/actions').SELECT_PIPELINE;

module.exports = function(pipelineId) {
  return {
    type: SELECT_PIPELINE,
    id: pipelineId
  };
};
