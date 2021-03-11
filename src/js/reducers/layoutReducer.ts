import {ActionType, getType} from 'typesafe-actions';
import {LayoutRecord} from '../store/factory/Layout';
import * as layoutActions from '../actions/layoutActions';

/**
 * This reducer handles layout updates
 * @param {Object} state - An Immutable state object
 * @param {Object} action - An action object
 */
export function layoutReducer(state: LayoutRecord,
  action: ActionType<typeof layoutActions>): LayoutRecord {
  // handle layout actions

  return state;
}