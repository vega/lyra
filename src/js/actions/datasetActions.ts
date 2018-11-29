import {createStandardAction} from 'typesafe-actions';
import {DatasetRecord, MType} from '../store/factory/Dataset';

const counter = require('../util/counter');
const SUMMARIZE_AGGREGATE = 'SUMMARIZE_AGGREGATE';
const ADD_DATA_TRANSFORM = 'ADD_DATA_TRANSFORM';
const UPDATE_DATA_TRANSFORM = 'UPDATE_DATA_TRANSFORM';

export const addDataset = createStandardAction('ADD_DATASET').map((payload: DatasetRecord) => {
  return {payload: payload.merge({_id: payload._id || counter.global()})}
});

export const deleteDataset = createStandardAction('DELETE_DATASET')<number, number>();

export const changeFieldMType = createStandardAction('CHANGE_FIELD_MTYPE')<{field: string, mtype: MType}, number>();

export const sortDataset = createStandardAction('SORT_DATASET')<{field: string, order: 'asc' | 'desc'}, number>();

/**
 * Action creator to update the summary fields calculated
 * in an aggregate transform.
 *
 * @param   {number} id        The ID of the aggregated dataset.
 * @param   {Object} summarize A summary definition.
 * @returns {Object} SUMMARIZE_AGGREGATE action.
 */
export function summarizeAggregate(id, summarize) {
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
export function addTransform(dsId, transform) {
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
export function updateTransform(dsId, index, transform) {
  return {
    type: UPDATE_DATA_TRANSFORM,
    id: dsId,
    index: index,
    transform: transform
  };
}
