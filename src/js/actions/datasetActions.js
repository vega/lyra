'use strict';

var dl = require('datalib'),
    counter = require('../util/counter'),
    ADD_DATASET = 'ADD_DATASET',
    DELETE_DATASET = 'DELETE_DATASET',
    CHANGE_FIELD_MTYPE = 'CHANGE_FIELD_MTYPE',
    SORT_DATASET  = 'SORT_DATASET',
    FACET_DATASET = 'FACET_DATASET',
    SUMMARIZE_AGGREGATE = 'SUMMARIZE_AGGREGATE',
    ADD_DATA_TRANSFORM = 'ADD_DATA_TRANSFORM',
    UPDATE_DATA_TRANSFORM = 'UPDATE_DATA_TRANSFORM';

/**
 * Action creator to add a new Dataset in the store.
 *
 * @param {Object} props - The properties of the dataset.
 * @param {Array} values - A JSON array of parsed values.
 * @param {Object} schema - The schema associated with the dataset
 * @returns {Object} An ADD_DATASET action.
 */
function addDataset(props, values, schema) {
  props = dl.extend({}, props, {
    _id: props._id || counter.global(),
    _schema: schema
  });

  return {
    type: ADD_DATASET,
    id: props._id,
    props: props,
    values: values
  };
}

function deleteDataset(dsId, pldId) {
  return {
    type: DELETE_DATASET,
    dsId: dsId,
    plId: pldId
  };
}

/**
 * Action creator to change a field's measure type.
 *
 * @param   {number} id    The ID of a dataset.
 * @param   {string} field The name of a field.
 * @param   {string} mtype Type of measure (nominal, quantitative, temporal).
 * @returns {Object} A CHANGE_FIELD_MTYPE action.
 */
function changeFieldMType(id, field, mtype) {
  return {
    type: CHANGE_FIELD_MTYPE,
    id: id,
    field: field,
    mtype: mtype
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
 * Action creator to add sort data transformations to dataset
 *
 * @param {number} dsId - Id of the dataset.
 * @param {ImmutableSet} groupby - A set of field names to groupby.
 * @returns {Object} A FACET_DATASET action.
 */
function facetDataset(dsId, groupby) {
  return {
    type: FACET_DATASET,
    id: dsId,
    groupby: groupby
  };
}

/**
 * Action creator to update the summary fields calculated
 * in an aggregate transform.
 *
 * @param   {number} id        The ID of the aggregated dataset.
 * @param   {Object} summarize A summary definition.
 * @returns {Object} SUMMARIZE_AGGREGATE action.
 */
function summarizeAggregate(id, summarize) {
  return {
    type: SUMMARIZE_AGGREGATE,
    id: id,
    summarize: summarize
  };
}

/**
 * Action creator to add a data transformations to the dataset.
 *
 * @param {number} dsId - Id of the dataset.
 * @param {object} transform - vega data transform object
 * @returns {Object} ADD_DATA_TRANSFORM action with info about
 * vega data transformation
 */
function addTransform(dsId, transform) {
  return {
    type: ADD_DATA_TRANSFORM,
    id: dsId,
    transform: transform
  };
}

/**
 * Action creator to edit an existing data transformation.
 *
 * @param {number} dsId - Id of the dataset.
 * @param {number} index - The index into the dataset's transform array.
 * @param {object} transform - Vega data transform object to replace the oldSpec
 * @returns {Object} UPDATE_DATA_TRANSFORM action with info about
 * vega data transformation
 */
function updateTransform(dsId, index, transform) {
  return {
    type: UPDATE_DATA_TRANSFORM,
    id: dsId,
    index: index,
    transform: transform
  };
}

module.exports = {
  // Action Names
  ADD_DATASET: ADD_DATASET,
  DELETE_DATASET: DELETE_DATASET,
  CHANGE_FIELD_MTYPE: CHANGE_FIELD_MTYPE,
  SORT_DATASET: SORT_DATASET,
  FACET_DATASET: FACET_DATASET,
  SUMMARIZE_AGGREGATE: SUMMARIZE_AGGREGATE,
  ADD_DATA_TRANSFORM: ADD_DATA_TRANSFORM,
  UPDATE_DATA_TRANSFORM: UPDATE_DATA_TRANSFORM,

  // Action Creators
  addDataset: addDataset,
  deleteDataset: deleteDataset,
  changeFieldMType: changeFieldMType,
  sortDataset: sortDataset,
  facetDataset: facetDataset,
  summarizeAggregate: summarizeAggregate,
  addTransform: addTransform,
  updateTransform: updateTransform
};
