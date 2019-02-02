import {createStandardAction} from 'typesafe-actions';
import {Transform} from 'vega-typings/types';
import {SortOrder} from '../constants/sortOrder';
import {DatasetRecord, MType} from '../store/factory/Dataset';

const counter = require('../util/counter');
const SUMMARIZE_AGGREGATE = 'SUMMARIZE_AGGREGATE';

export const addDataset = createStandardAction('ADD_DATASET').map((payload: DatasetRecord) => {
  const id: number = payload._id || counter.global();
  return {payload: payload.merge({_id: id}), meta: id}
});

export const deleteDataset = createStandardAction('DELETE_DATASET')<number, number>();

export const changeFieldMType = createStandardAction('CHANGE_FIELD_MTYPE')<{field: string, mtype: MType}, number>();

export const sortDataset = createStandardAction('SORT_DATASET')<{field: string, order: SortOrder}, number>();

// export const summarizeAggregate = createStandardAction('SUMMARIZE_AGGREGATE')<, number>();

export const addTransform = createStandardAction('ADD_DATA_TRANSFORM')<Transform, number>();

export const updateTransform = createStandardAction('UPDATE_DATA_TRANSFORM')<{index: number, transform: Transform}, number>();
// TODO: End of Arvind's typesafe datasetActions refactor.

// TODO: summarize is outdated in latest Vega.
// https://github.com/vega/vega/wiki/Data-Transforms#-aggregate
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
