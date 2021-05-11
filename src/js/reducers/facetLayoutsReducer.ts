import {Map} from 'immutable';
import {ActionType, getType} from 'typesafe-actions';
import {FacetLayoutState} from '../store/factory/FacetLayout';
import * as FacetLayoutActions from '../actions/facetLayoutActions';

/**
 * This reducer handles layout updates
 * @param {Object} state - An Immutable state object
 * @param {Object} action - An action object
 */
export function facetLayoutsReducer(state: FacetLayoutState,
  action: ActionType<typeof FacetLayoutActions>): FacetLayoutState {
  const id = String(action.meta);

  if (typeof state === 'undefined') {
    return Map();
  }

  if (action.type === getType(FacetLayoutActions.baseAddFacetLayout)) {
    return state.set(id, action.payload);
  }

  return state;
}