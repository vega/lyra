'use strict';

var dl = require('datalib'),
    counter = require('../util/counter'),
    ADD_DATASET = 'ADD_DATASET',
    SORT_DATASET = 'SORT_DATASET',
    SUMMARIZE_AGGREGATE = 'SUMMARIZE_AGGREGATE',
    ADD_DATA_TRANSFORM = 'ADD_DATA_TRANSFORM',
    EDIT_DATA_TRANSFORM = 'EDIT_DATA_TRANSFORM';

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

/**
 * Action creator to add sort data transformations to dataset
 *
 * @param {number} dsId - Id of the dataset.
 * @param {string} field - Field to be sorted.
 * @param {string} order - Either 'asc' or 'desc'
 * indicating order of sort of the field.
 * @returns {Object} SORT_DATASET action with info about
 * field to be sorted
 */
function sortDataset(dsId, field, order) {
  return {
    type: SORT_DATASET,
    id: dsId,
    field: field,
    order: order
  };
}

function summarizeAggregate(id, summarize) {
  return {
    type: SUMMARIZE_AGGREGATE,
    id: id,
    summarize: summarize
  };
}

/**
 * Action creator to add a data transformations to the dataset
 *
 * @param {number} dsId - Id of the dataset.
 * @param {object} transformSpec - vega data transform object
 * @returns {Object} ADD_DATA_TRANSFORM action with info about
 * vega data transformation
 */
function addTransform(dsId, transformSpec) {
  return {
    type: ADD_DATA_TRANSFORM,
    id: dsId,
    transformSpec: transformSpec
  };
}

/**
 * Action creator to edit a data transformations to the dataset
 *
 * @param {number} dsId - Id of the dataset.
 * @param {number} specId - vega data transform index for the old spec to be replaced
 * @param {object} newSpec - vega data transform object to replace the oldSpec
 * @returns {Object} EDIT_DATA_TRANSFORM action with info about
 * vega data transformation
 */
function editTransform(dsId, specId, newSpec) {
  return {
    type: EDIT_DATA_TRANSFORM,
    id: dsId,
    specId: specId,
    newSpec: newSpec
  };
}

module.exports = {
  // Action Names
  ADD_DATASET: ADD_DATASET,
  SORT_DATASET: SORT_DATASET,
  SUMMARIZE_AGGREGATE: SUMMARIZE_AGGREGATE,
  ADD_DATA_TRANSFORM: ADD_DATA_TRANSFORM,
  EDIT_DATA_TRANSFORM: EDIT_DATA_TRANSFORM,

  // Action Creators
  addDataset: addDataset,
  sortDataset: sortDataset,
  filterDataset: filterDataset,
  showExpressionTextbox: showExpressionTextbox,
  summarizeAggregate: summarizeAggregate,
  addTransform: addTransform,
  editTransform: editTransform
};
