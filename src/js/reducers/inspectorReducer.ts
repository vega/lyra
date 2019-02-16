import {ActionType, getType} from 'typesafe-actions';
import * as inspectorActions from '../actions/inspectorActions';
import * as markActions from '../actions/markActions';
import {ExpandedLayers, Inspector, InspectorRecord} from '../store/factory/Inspector';

function expandLayers(state: InspectorRecord, layerIds: number[]): InspectorRecord {
  return layerIds.reduce(function(newState: InspectorRecord, layerId: number) {
    return newState.setIn(['encodings', 'expandedLayers', layerId], true);
  }, state);
}

export function inspectorReducer(state: InspectorRecord, action: ActionType<typeof inspectorActions | typeof markActions.addMark>): InspectorRecord {
  if (typeof state === 'undefined') {
    return Inspector();
  }

  if (action.type === getType(inspectorActions.selectPipeline)) {
    return state.setIn(['pipelines', 'selectedId'], action.payload);
  }

  if (action.type === getType(inspectorActions.selectGuide)) {
    state = state.setIn(['encodings', 'selectedId'], action.payload);
    state = state.setIn(['encodings', 'selectedType'], action.type);
  }

  if (action.type === getType(inspectorActions.selectMark) || action.type === getType(markActions.addMark) ||
      action.type === getType(inspectorActions.selectScale)) {
      state = state.setIn(['encodings', 'selectedId'], action.payload);
      state = state.setIn(['encodings', 'selectedType'], action.type === getType(markActions.addMark) ? getType(inspectorActions.selectMark) : action.type);
  }

  if (action.type === getType(inspectorActions.selectMark)) {
    const hierarchy = require('../util/hierarchy');
    const parentGroupIds = hierarchy.getParentGroupIds(action.payload);

    return expandLayers(state, parentGroupIds);
  }

  // Auto-select new marks
  if (action.type === getType(markActions.addMark)) {
    const layers: ExpandedLayers = {};
    layers[action.payload.props._parent] = true;
    if (action.payload.props.type === 'group') {
      layers[action.meta] = true;
    }
    return state = state.mergeIn(['encodings', 'expandedLayers'], layers);
  }

  if (action.type === getType(inspectorActions.expandLayers)) {
    return expandLayers(state, action.payload);
  }

  if (action.type === getType(inspectorActions.removeLayers)) {
    return action.payload.reduce(function(newState, layerId) {
      return newState.deleteIn(['encodings', 'expandedLayers', layerId]);
    }, state);
  }

  if (action.type === getType(inspectorActions.toggleLayers)) {
    return action.payload.reduce(function(newState, layerId) {
      const key = ['encodings', 'expandedLayers', layerId];
      return newState.setIn(key, !newState.getIn(key));
    }, state);
  }

  return state;
}
