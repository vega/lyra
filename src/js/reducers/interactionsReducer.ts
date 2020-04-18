import {Map} from 'immutable';
import {ActionType, getType} from 'typesafe-actions';
import * as interactionActions from '../actions/interactionActions';
import {InteractionState, InteractionSignal} from '../store/factory/Interaction';

export function interactionsReducer(state: InteractionState, action: ActionType<typeof interactionActions>): InteractionState {
  const id = action.meta;

  if (typeof state === 'undefined') {
    return Map();
  }

  if (action.type === getType(interactionActions.baseAddInteraction)) {
    return state.set(String(id), action.payload);
  }

  if (action.type === getType(interactionActions.setInput)) {
    return state.setIn([String(id), 'input'], action.payload);
  }

  if (action.type === getType(interactionActions.setSelection)) {
    return state.setIn([String(id), 'selection'], action.payload);
  }

  if (action.type === getType(interactionActions.setApplication)) {
    const applications = state.getIn([String(id), 'applications']);
    const withoutPayload = applications.filter(application => application.id !== action.payload.id);
    return state.setIn([String(id), 'applications'], [...withoutPayload, action.payload]);
  }

  if (action.type === getType(interactionActions.setSignals)) {
    return state.setIn([String(id), 'signals'], action.payload);
  }

  if (action.type === getType(interactionActions.setSignalPush)) {
    const signals: InteractionSignal[] = state.getIn([String(id), 'signals']);
    signals.forEach(s => {
      if (s.signal in action.payload) {
        s.push = action.payload[s.signal];
      }
    })
    return state.setIn([String(id), 'signals'], signals);
  }

  if (action.type === getType(interactionActions.removeApplication)) {
    const applications = state.getIn([String(id), 'applications']);
    const withoutPayload = applications.filter(application => application.id !== action.payload.id);
    return state.setIn([String(id), 'applications'], withoutPayload);
  }

  if (action.type === getType(interactionActions.deleteInteraction)) {
    return state.remove(String(id));
  }

  if (action.type === getType(interactionActions.updateInteractionName)) {
    return state.setIn([String(id), 'name'], action.payload);
  }

  return state;
}
