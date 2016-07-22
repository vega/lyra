'use strict';

var dl = require('datalib'),
    counter = require('../util/counter'),
    ADD_DATASET = 'ADD_DATASET';

/**
 * Action creator to add a new Dataset in the store.
 *
 * @param {Object} props - The properties of the dataset.
 * @param {Array} values - A JSON array of parsed values.
 * @returns {Object} An ADD_DATASET action.
 */
function addDataset(props, values) {
  props = dl.extend({
    _id: props._id || counter.global()
  }, props);

  return {
    type: ADD_DATASET,
    id: props._id,
    props: props,
    values: values
  };
}

module.exports = {
  // Action Names
  ADD_DATASET: ADD_DATASET,

  // Action Creators
  addDataset: addDataset
};
