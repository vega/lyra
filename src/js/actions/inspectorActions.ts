import {createStandardAction} from 'typesafe-actions';
import {ThunkAction} from 'redux-thunk';
import {State} from '../store';
import {AnyAction} from 'redux';
import {startBatch, endBatch} from './historyActions';
import {deleteMark, baseDeleteMark} from './markActions';
import {getParentGroupIds} from '../util/hierarchy';

export namespace InspectorSelectedType {
  export const SELECT_GUIDE = 'SELECT_GUIDE';
  export const SELECT_MARK = 'SELECT_MARK';
  export const SELECT_PIPELINE = 'SELECT_PIPELINE';
  export const SELECT_SCALE = 'SELECT_SCALE';
}
export type InspectorSelectedType = 'SELECT_GUIDE' | 'SELECT_MARK' | 'SELECT_PIPELINE' | 'SELECT_SCALE';

/**
 * Return an object for the action to toggle a set of layers.
 *
 * @param {number[]} layerIds - Array of layer IDs to toggle
 * @returns {Object} Redux action
 */
export const toggleLayers = createStandardAction('TOGGLE_LAYERS')<number[]>();

/**
 * Return an object for the action to expand a set of layers.
 *
 * @param {number[]} layerIds - Array of layer IDs to expand
 * @returns {Object} Redux action
 */
export const expandLayers = createStandardAction('EXPAND_LAYERS')<number[]>();

/**
 * Remove layers from the expand layers store
 *
 * @param {number[]} layerIds - Array of layer IDs to expand
 * @returns {Object} Redux action
 */
export const removeLayers = createStandardAction('REMOVE_LAYERS')<number[]>();

export const selectGuide = createStandardAction(InspectorSelectedType.SELECT_GUIDE)<number>();
export const baseSelectMark = createStandardAction(InspectorSelectedType.SELECT_MARK)<number, number[]>();

export function selectMark(id: number): ThunkAction<void, State, null, AnyAction> {
  return function(dispatch, getState) {
    const parentGroupIds = getParentGroupIds(id, getState());
    dispatch(baseSelectMark(id, parentGroupIds));

  };
}

export const selectPipeline = createStandardAction(InspectorSelectedType.SELECT_PIPELINE)<number>();
export const selectScale = createStandardAction(InspectorSelectedType.SELECT_SCALE)<number>();
