'use strict';

var dl = require('datalib'),
    counter = require('../util/counter'),
    ADD_DATASET = 'ADD_DATASET',
    INIT_DATASET = 'INIT_DATASET';

/**
 * Action creator to add a new Dataset in the store.
 *
 * @param {Object} props - The properties of the dataset.
 * @param {Array} [values] - Array of raw values to initialize the dataset with.
 * @returns {Object} An ADD_DATASET action.
 */
function addDataset(props, values) {
  props = dl.extend({
    _id: props._id || counter.global(),
    _init: false  // Have the raw values been loaded + schema constructed?
  }, props);

  return {
    type: ADD_DATASET,
    id: props._id,
    props: props,
    values: values
  };
}

/**
 * Action creator to indicate that a Dataset's raw values have been loaded, and
 * a schema has been constructed.
 *
 * @param  {number} id The ID of the Dataset that has been initialized.
 * @returns {Object} An INIT_DATASET action.
 */
function initDataset(id) {
  return {
    type: INIT_DATASET,
    id: id
  };
}

module.exports = {
  // Action Names
  ADD_DATASET: ADD_DATASET,
  INIT_DATASET: INIT_DATASET,

  // Action Creators
  addDataset: addDataset,
  initDataset: initDataset
};
