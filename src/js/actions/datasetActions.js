'use strict';

var dl = require('datalib'),
    counter = require('../util/counter'),
    ADD_DATASET = 'ADD_DATASET',
    SORT_DATASET = 'SORT_DATASET';

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

/**
 * Action creator to add transformations to dataset
 *
 * @param {number} dsId - Id of the dataset.
 * @param {string} sortField - Field to be sorted.
 * @param {string} sortOrder - Either 'asc' or 'desc'
 * indicating order of sort of the sortField.
 * @returns {Object} SORT_DATASET action with info about
 * field to be sorted
 */
function sortDataset(dsId, sortField, sortOrder) {
  return {
    type: SORT_DATASET,
    id: dsId,
    sortField: sortField,
    sortOrder: sortOrder
  };
}

module.exports = {
  // Action Names
  ADD_DATASET: ADD_DATASET,
  SORT_DATASET: SORT_DATASET,

  // Action Creators
  addDataset: addDataset,
  sortDataset: sortDataset
};
