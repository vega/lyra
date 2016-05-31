'use strict';

var CREATE_PIPELINE = require('../constants/actions').CREATE_PIPELINE;

/**
 * Action creator to create a new Pipeline in the store
 */
module.exports = function(id) {
  return {
    type: CREATE_PIPELINE,
    id: id
  };
};
