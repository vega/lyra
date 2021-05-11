import {createStandardAction} from 'typesafe-actions';
import {FacetLayoutRecord} from '../store/factory/FacetLayout';
import {assignId} from '../util/counter';
import {State} from '../store';
import {Dispatch} from 'redux';

export function addFacetLayout (payload: FacetLayoutRecord) {
  return function(dispatch: Dispatch, getState: () => State) {
    const id = payload._id || assignId(dispatch, getState());
    dispatch(baseAddFacetLayout(payload.merge({_id: id}), id));
  };
}

export const baseAddFacetLayout = createStandardAction('ADD_FACET_LAYOUT')<FacetLayoutRecord, number>();