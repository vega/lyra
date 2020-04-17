import {createStandardAction} from 'typesafe-actions';
import {ScaleRecord} from '../store/factory/Scale';
import {assignId} from '../util/counter';
import {State} from '../store';
import {Dispatch} from 'redux';

export function addScale (payload: ScaleRecord) {
  return function(dispatch: Dispatch, getState: () => State) {
    const id = payload._id || assignId(dispatch, getState());

    dispatch(baseAddScale(payload.merge({_id: id}), id));
  };
}
export const baseAddScale = createStandardAction('ADD_SCALE')<ScaleRecord, number>();

export const updateScaleProperty = createStandardAction('UPDATE_SCALE_PROPERTY')<{property: string, value: any}, number>();

export const amendDataRef = createStandardAction('AMEND_DATA_REF')<{property: string, ref: any}, number>();

export const deleteScale = createStandardAction('DELETE_SCALE')<null, number>();
