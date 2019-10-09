import {createStandardAction} from 'typesafe-actions';
import {AggregateTransform, Compare, Transforms, Datum} from 'vega-typings/types';
import {DatasetRecord, MType} from '../store/factory/Dataset';

const counter = require('../util/counter');

export const addDataset = createStandardAction('ADD_DATASET').map((payload: DatasetRecord, meta: Datum[]) => {
  const id: number = payload._id || counter.global();
  return {payload: payload.merge({_id: id}), meta}
});

export const deleteDataset = createStandardAction('DELETE_DATASET')<number, number>();

export const changeFieldMType = createStandardAction('CHANGE_FIELD_MTYPE')<{field: string, mtype: MType}, number>();

export const sortDataset = createStandardAction('SORT_DATASET')<Compare, number>();

export const summarizeAggregate = createStandardAction('SUMMARIZE_AGGREGATE')<AggregateTransform, number>();

export const addTransform = createStandardAction('ADD_DATA_TRANSFORM')<Transforms, number>();

export const updateTransform = createStandardAction('UPDATE_DATA_TRANSFORM')<{index: number, transform: Transforms}, number>();
