import {AnyAction, Dispatch} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {createStandardAction} from 'typesafe-actions';
import {batchGroupBy} from '../reducers/historyOptions';
import {State} from '../store';
import {SceneRecord} from '../store/factory/marks/Scene';
import {deleteMark} from './markActions';
import {assignId} from '../util/counter';

const getInVis = require('../util/immutable-utils').getInVis;

export function createScene (payload: SceneRecord) {
  return function(dispatch: Dispatch, getState: () => State) {
    const id: number = payload._id || assignId(dispatch, getState());

    dispatch(baseCreateScene({
      props: payload.merge({_id: id}),
      name: 'Scene'
    }, id));
  }
}
export const baseCreateScene = createStandardAction('CREATE_SCENE')<{props: SceneRecord, name: string}, number>();
export function clearScene(): ThunkAction<void, State, null, AnyAction> {
  return function(dispatch, getState) {
    const state = getState();
    const sceneId = getInVis(state, 'scene._id');
    const children = getInVis(state, 'marks.' + sceneId + '.marks');

    batchGroupBy.start();

    children.forEach(function(childId) {
      dispatch(deleteMark(childId));
    });

    batchGroupBy.end();
  };
}
