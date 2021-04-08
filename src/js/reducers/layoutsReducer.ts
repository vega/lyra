import {Map} from 'immutable';
import {ActionType, getType} from 'typesafe-actions';
import {LayoutState} from '../store/factory/Layout';
import * as layoutActions from '../actions/layoutActions';

/**
 * This reducer handles layout updates
 * @param {Object} state - An Immutable state object
 * @param {Object} action - An action object
 */
export function layoutsReducer(state: LayoutState,
  action: ActionType<typeof layoutActions>): LayoutState {
  // handle layout actions
  const id = String(action.meta);

  if (typeof state === 'undefined') {
    return Map();
  }

  if (action.type === getType(layoutActions.baseAddLayout)) {
    return state.set(id, action.payload);
  }
  if (action.type === getType(layoutActions.baseAddGrouptoLayout)) {
    const groups = state.getIn([id, 'groups']);
    const withoutPayload = groups.filter(group => group.id !== action.payload.group._id);
    state = state.setIn([id, "groups"], [ ...withoutPayload, action.payload.group._id]);

    if (action.payload.dir == 'top' || action.payload.dir == 'bottom' ) {
      const newRows = state.getIn([id, 'rows'])+1;
      state = state.setIn([id, "rows"], newRows);

      const originalRows = state.getIn([id, 'rowSizes']);
      if (action.payload.dir == 'top') {
        state = state.setIn([id, "rowSizes"], [action.payload.group.encode.update.height, ...originalRows]);
      } else {
        state = state.setIn([id, "rowSizes"], [ ...originalRows, action.payload.group.encode.update.height]);
      }
    } else if (action.payload.dir == 'right' || action.payload.dir == 'left' ) {
      const newCols = state.getIn([id, 'cols'])+1;
      state = state.setIn([id, "cols"], newCols);

      const originalCols = state.getIn([id, 'colSizes']);
      if (action.payload.dir == 'left') {
        state = state.setIn([id, "colSizes"], [action.payload.group.encode.update.width, ...originalCols]);
      } else {
        const newCols = [ ...originalCols, action.payload.group.encode.update.width];
        state = state.setIn([id, "colSizes"], newCols);
      }
    } else if (action.payload.dir == 'init') {
      const newRows = state.getIn([id, 'rows'])+1;
      state = state.setIn([id, "rows"], newRows);
      const newCols = state.getIn([id, 'cols'])+1;
      state = state.setIn([id, "cols"], newCols);

      state = state.setIn([id, "colSizes"], [action.payload.group.encode.update.width]);
      state = state.setIn([id, "rowSizes"], [action.payload.group.encode.update.height]);

    }
    return state;
  }
  if (action.type === getType(layoutActions.baseAddPlaceholdertoLayout)) {
    const originalPlaceholders =  state.getIn([id, 'placeHolders']);
    return state.setIn([id, 'placeHolders'], [...originalPlaceholders, action.payload])
  }
  if (action.type == getType(layoutActions.removePlaceHolder)) {
    const originalPlaceholders =  state.getIn([id, 'placeHolders']);
    const filteredPlaceholders = originalPlaceholders.filter(holder => holder._id != action.payload);
    return state.setIn([id, 'placeHolders'], filteredPlaceholders);
  }
  if (action.type == getType(layoutActions.setPlaceholderProperty)) {
    const placeholders = state.getIn([id, 'placeHolders']);
    const newPlaceholders = placeholders.filter(placeholder => placeholder._id != action.payload._id);
    return state.setIn([id, 'placeHolders'], [...newPlaceholders, action.payload]);
  }

  return state;
}