'use strict';

var dl = require('datalib'),
    counter = require('../util/counter'),
    ADD_DATASET = 'ADD_DATASET';

/**
 * Action creator to add a new Dataset in the store.
 *
 * @param {Object} props - The properties of the dataset.
 * @param {Array} values - A JSON array of parsed values.
 * @param {Object} schema - The schema associated with the dataset
 * @returns {Object} An ADD_DATASET action.
 */
function addDataset(props, values, schema) {
  props = dl.extend({
    _id: props._id || counter.global()
  }, props);

  return {
    type: ADD_DATASET,
    id: props._id,
    props: props,
    values: values,
    schema: schema
  };
}

module.exports = {
  // Action Names
  ADD_DATASET: ADD_DATASET,

  // Action Creators
  addDataset: addDataset
};
