import {createStandardAction} from 'typesafe-actions';
import {GuideRecord} from '../store/factory/Guide';
import {Dispatch} from 'redux';
import {State} from '../store';
import {assignId} from '../util/counter';

export function addGuide (payload: GuideRecord) {
  return function(dispatch: Dispatch, getState: () => State) {
    const id = payload._id || assignId(dispatch, getState());

    dispatch(baseAddGuide(payload.merge({_id: id}), id));
  };
}
export const baseAddGuide = createStandardAction('ADD_GUIDE')<GuideRecord, number>();

export const deleteGuide = createStandardAction('DELETE_GUIDE')<{groupId: number}, number>();

export const updateGuideProperty = createStandardAction('UPDATE_GUIDE_PROPERTY')<{property: string, value: any}, number>();
