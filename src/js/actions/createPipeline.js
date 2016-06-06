'use strict';

var CREATE_PIPELINE = require('../constants/actions').CREATE_PIPELINE;

/**
 * Action creator to create a new Pipeline in the store
 *
 * @param {string} id - The string ID to use for this pipeline
 * @returns {object} A CREATE_PIPELINE action object
 */
module.exports = function(id) {
  return {
    type: CREATE_PIPELINE,
    id: id
  };
};
