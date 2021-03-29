import {AnyAction} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {createStandardAction} from 'typesafe-actions';
import {State} from '../store';
import {DraggingStateRecord} from '../store/factory/Inspector';
import {getParentGroupIds} from '../util/hierarchy';

export namespace InspectorSelectedType {
  export const SELECT_GUIDE = 'SELECT_GUIDE';
  export const SELECT_MARK = 'SELECT_MARK';
  export const SELECT_PIPELINE = 'SELECT_PIPELINE';
  export const SELECT_HISTORY = 'SELECT_HISTORY';
  export const SELECT_SCALE = 'SELECT_SCALE';
  export const SELECT_INTERACTION = 'SELECT_INTERACTION';
  export const SELECT_WIDGET = 'SELECT_WIDGET';
}
export type InspectorSelectedType = 'SELECT_GUIDE' | 'SELECT_MARK' | 'SELECT_HISTORY' | 'SELECT_PIPELINE' | 'SELECT_SCALE' | 'SELECT_INTERACTION' | 'SELECT_WIDGET';

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
export const selectHistory = createStandardAction(InspectorSelectedType.SELECT_HISTORY)<number>();
export const selectScale = createStandardAction(InspectorSelectedType.SELECT_SCALE)<number>();
export const selectInteraction = createStandardAction(InspectorSelectedType.SELECT_INTERACTION)<number>();
export const selectWidget = createStandardAction(InspectorSelectedType.SELECT_WIDGET)<number>();

export const startDragging = createStandardAction('START_DRAGGING')<DraggingStateRecord>();
export const stopDragging = createStandardAction('STOP_DRAGGING')();
