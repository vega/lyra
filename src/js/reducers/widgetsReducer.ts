import {Map} from 'immutable';
import {ActionType, getType} from 'typesafe-actions';
import * as widgetActions from '../actions/widgetActions';
import {WidgetState} from '../store/factory/Widget';

export function widgetsReducer(state: WidgetState, action: ActionType<typeof widgetActions>): WidgetState {
  const id = action.meta;

  if (typeof state === 'undefined') {
    return Map();
  }

  if (action.type === getType(widgetActions.baseAddWidget)) {
    return state.set(String(id), action.payload);
  }

  if (action.type === getType(widgetActions.setSelection)) {
    return state.setIn([String(id), 'selection'], action.payload);
  }

  if (action.type === getType(widgetActions.setApplication)) {
    const applications = state.getIn([String(id), 'applications']);
    const withoutPayload = applications.filter(application => application.id !== action.payload.id);
    return state.setIn([String(id), 'applications'], [...withoutPayload, action.payload]);
  }

  if (action.type === getType(widgetActions.removeApplication)) {
    const applications = state.getIn([String(id), 'applications']);
    const withoutPayload = applications.filter(application => application.id !== action.payload.id);
    return state.setIn([String(id), 'applications'], withoutPayload);
  }

  if (action.type === getType(widgetActions.deleteWidget)) {
    return state.remove(String(id));
  }

  if (action.type === getType(widgetActions.updateWidgetName)) {
    return state.setIn([String(id), 'name'], action.payload);
  }

  return state;
}
