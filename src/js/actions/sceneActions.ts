import {AnyAction} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {createStandardAction} from 'typesafe-actions';
import {batchGroupBy} from '../reducers/historyOptions';
import {State} from '../store';
import {SceneRecord} from '../store/factory/marks/Scene';
import {deleteMark} from './markActions';

const counter = require('../util/counter');
const getInVis = require('../util/immutable-utils').getInVis;

export const createScene = createStandardAction('CREATE_SCENE').map((payload: SceneRecord) => {
  const id: number = payload._id || counter.global();
  return {
    payload: {
      props: payload.merge({_id: id}),
      name: 'Scene'
    },
    meta: id
  };
});
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
