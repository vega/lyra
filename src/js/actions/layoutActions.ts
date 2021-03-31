import {createStandardAction} from 'typesafe-actions';
import {LayoutRecord} from '../store/factory/Layout';
import {assignId} from '../util/counter';
import {State} from '../store';
import {Dispatch} from 'redux';
import {MarkRecord} from '../store/factory/Mark';

export function addLayout (payload: LayoutRecord) {
  return function(dispatch: Dispatch, getState: () => State) {
    const id = payload._id || assignId(dispatch, getState());
    dispatch(baseAddLayout(payload.merge({_id: id}), id));
  };
}
export const baseAddLayout = createStandardAction('ADD_LAYOUT')<LayoutRecord, number>();

export const addGrouptoLayout = createStandardAction('ADD_GROUP_TO_LAYOUT')<{group: MarkRecord, dir: string}, number>();