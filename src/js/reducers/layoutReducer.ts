import {Map} from 'immutable';
import {ActionType, getType} from 'typesafe-actions';
import {LayoutState} from '../store/factory/Layout';
import * as layoutActions from '../actions/layoutActions';

/**
 * This reducer handles layout updates
 * @param {Object} state - An Immutable state object
 * @param {Object} action - An action object
 */
export function layoutReducer(state: LayoutState,
  action: ActionType<typeof layoutActions>): LayoutState {
  // handle layout actions
  const id = action.meta;

  if (typeof state === 'undefined') {
    return Map();
  }

  if (action.type === getType(layoutActions.baseAddLayout)) {
    return state.set(String(id), action.payload);
  }
  else if (action.type === getType(layoutActions.addGrouptoLayout)) {
    const groups = state.getIn([String(id), 'groups']);
    const withoutPayload = groups.filter(group => group.id !== action.payload.groupId);
    return state.setIn([String(id), "groups"], [ ...withoutPayload, action.payload.groupId]);
  }

  return state;
}