import {createStandardAction} from 'typesafe-actions';
import {SceneRecord} from '../store/factory/marks/Scene';
import {deleteMark} from './markActions';

const dl = require('datalib');
const counter = require('../util/counter');
const getInVis = require('../util/immutable-utils').getInVis;
const historyActions = require('./historyActions');
const startBatch = historyActions.startBatch;
const endBatch = historyActions.endBatch;

export const createScene = createStandardAction('CREATE_SCENE').map((payload: SceneRecord) => {
  const id: number = payload._id || counter.global();
  return {
    payload: {
      props: payload.merge({_id: id, name: 'Scene'}),
      name: 'Scene'
    },
    meta: id
  };
});
export function clearScene() {
  return function(dispatch, getState) {
    const state = getState();
    const sceneId = getInVis(state, 'scene.id');
    const children = getInVis(state, 'marks.' + sceneId + '.marks');

    dispatch(startBatch());

    children.forEach(function(childId) {
      dispatch(deleteMark(childId));
    });

    dispatch(endBatch());
  };
}
