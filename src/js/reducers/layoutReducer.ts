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
    const withoutPayload = groups.filter(group => group.id !== action.payload.group._id);
    state = state.setIn([String(id), "groups"], [ ...withoutPayload, action.payload.group._id]);

    if (action.payload.dir == 'top' || action.payload.dir == 'bottom' ) {
      const newRows = state.getIn([String(id), 'rows'])+1;
      state = state.setIn([String(id), "rows"], newRows);

      const originalRows = state.getIn([String(id), 'rowSizes']);
      if (action.payload.dir == 'top') {
        state = state.setIn([String(id), "rowSizes"], [action.payload.group.encode.update.height, ...originalRows]);
      } else {
        state = state.setIn([String(id), "rowSizes"], [ ...originalRows, action.payload.group.encode.update.height]);
      }
    } else if (action.payload.dir == 'right' || action.payload.dir == 'left' ) {
      const newCols = state.getIn([String(id), 'cols'])+1;
      state = state.setIn([String(id), "cols"], newCols);

      const originalCols = state.getIn([String(id), 'colSizes']);
      if (action.payload.dir == 'left') {
        state = state.setIn([String(id), "colSizes"], [action.payload.group.encode.update.width, ...originalCols]);
      } else {
        const newCols = [ ...originalCols, action.payload.group.encode.update.width];
        state = state.setIn([String(id), "colSizes"], newCols);
      }
    }
  }

  return state;
}