'use strict';
var PIPELINE_SELECT = require('../constants/actions').PIPELINE_SELECT;

module.exports = function(pipelineId) {
  return {
    type: PIPELINE_SELECT,
    id: pipelineId
  };
};
