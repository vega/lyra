import {createStandardAction} from 'typesafe-actions';
import {AggregateTransform, Compare, Transforms, Datum, IdentifierTransform} from 'vega-typings/types';
import {DatasetRecord, MType} from '../store/factory/Dataset';
import {Dispatch} from 'redux';
import {State} from '../store';
import {assignId} from '../util/counter';

export function addDataset (payload: DatasetRecord, meta: Datum[]) {
  return function(dispatch: Dispatch, getState: () => State) {
    const id = payload._id || assignId(dispatch, getState());
    const hasIdentifierTransform = payload.transform.filter(transform => transform.type === 'identifier').length > 0;
    if (!hasIdentifierTransform) {
      payload.transform.push({
        type: 'identifier',
        as: '_vgsid_'
      } as IdentifierTransform);
    }
    dispatch(baseAddDataset(payload.merge({_id: id}), meta));
  };
}
export const baseAddDataset = createStandardAction('ADD_DATASET')<DatasetRecord, Datum[]>();


export const deleteDataset = createStandardAction('DELETE_DATASET')<number, number>();

export const changeFieldMType = createStandardAction('CHANGE_FIELD_MTYPE')<{field: string, mtype: MType}, number>();

export const sortDataset = createStandardAction('SORT_DATASET')<Compare, number>();

export const summarizeAggregate = createStandardAction('SUMMARIZE_AGGREGATE')<AggregateTransform, number>();

export const addTransform = createStandardAction('ADD_DATA_TRANSFORM')<Transforms, number>();

export const updateTransform = createStandardAction('UPDATE_DATA_TRANSFORM')<{index: number, transform: Transforms}, number>();
