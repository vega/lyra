'use strict';

var dl = require('datalib'),
    counter = require('../util/counter'),
    ADD_DATASET = 'ADD_DATASET';

/**
 * Action creator to add a new Dataset in the store.
 *
 * @param {Object} props - The properties of the dataset.
 * @param {Array|string} rawVals - An array of raw values or a CSV/TSV string.
 * @param {Array} parsedVals - A JSON array of parsed values.
 * @returns {Object} An ADD_DATASET action.
 */
function addDataset(props, rawVals, parsedVals) {
  props = dl.extend({
    _id: props._id || counter.global()
  }, props);

  return {
    type: ADD_DATASET,
    id: props._id,
    props: props,
    rawVals: rawVals,
    parsedVals: parsedVals
  };
}

module.exports = {
  // Action Names
  ADD_DATASET: ADD_DATASET,

  // Action Creators
  addDataset: addDataset
};
