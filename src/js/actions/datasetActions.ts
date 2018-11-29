import {createStandardAction} from 'typesafe-actions';
import {DatasetRecord, MType} from '../store/factory/Dataset';

const counter = require('../util/counter');
const SORT_DATASET = 'SORT_DATASET';
const SUMMARIZE_AGGREGATE = 'SUMMARIZE_AGGREGATE';
const ADD_DATA_TRANSFORM = 'ADD_DATA_TRANSFORM';
const UPDATE_DATA_TRANSFORM = 'UPDATE_DATA_TRANSFORM';

export const addDataset = createStandardAction('ADD_DATASET').map((payload: DatasetRecord) => {
  const id: number = payload._id || counter.global();
  return {payload: payload.merge({_id: id}), meta: id}
});

export const deleteDataset = createStandardAction('DELETE_DATASET')<number, number>();

export const changeFieldMType = createStandardAction('CHANGE_FIELD_MTYPE')<{field: string, mtype: MType}, number>();

// TODO: End of Arvind's typesafe datasetActions refactor.

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
