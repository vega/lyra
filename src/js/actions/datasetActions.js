'use strict';

var dl = require('datalib'),
    counter = require('../util/counter'),
    ADD_DATASET = 'ADD_DATASET',
    SORT_DATASET = 'SORT_DATASET',
    FILTER_DATASET = 'FILTER_DATASET',
    SHOW_EXPRESSION_TEXTBOX = 'SHOW_EXPRESSION_TEXTBOX',
    SUMMARIZE_AGGREGATE = 'SUMMARIZE_AGGREGATE';

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

/**
 * Action creator to add filter data transformations to dataset
 *
 * @param {number} dsId - Id of the dataset.
 * @param {string} expression - expression (in JavaScript
 * syntax) for the filter predicate. The expression language
 * includes the variable datum, corresponding to the current
 * data object.
 * @returns {Object} FILTER_DATASET action with info about
 * field to be filtered
 */
function filterDataset(dsId, expression) {
  return {
    type: FILTER_DATASET,
    id: dsId,
    expression: expression
  };
}

function showExpressionTextbox(dsId, show, time) {
  return {
    type: SHOW_EXPRESSION_TEXTBOX,
    id: dsId,
    show: show,
    time: time
  };
}

function summarizeAggregate(id, summarize) {
  return {
    type: SUMMARIZE_AGGREGATE,
    id: id,
    summarize: summarize
  };
}

module.exports = {
  // Action Names
  ADD_DATASET: ADD_DATASET,
  SORT_DATASET: SORT_DATASET,
  FILTER_DATASET: FILTER_DATASET,
  SHOW_EXPRESSION_TEXTBOX: SHOW_EXPRESSION_TEXTBOX,
  SUMMARIZE_AGGREGATE: SUMMARIZE_AGGREGATE,

  // Action Creators
  addDataset: addDataset,
  sortDataset: sortDataset,
  filterDataset: filterDataset,
  showExpressionTextbox: showExpressionTextbox,
  summarizeAggregate: summarizeAggregate
};
