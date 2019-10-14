import {Map} from 'immutable';
import {ActionType, getType} from 'typesafe-actions';
import * as interactionActions from '../actions/interactionActions';
import {InteractionState} from '../store/factory/Interaction';

export function interactionsReducer(state: InteractionState, action: ActionType<typeof interactionActions>): InteractionState {
  const id = action.meta;

  if (typeof state === 'undefined') {
    return Map();
  }

  if (action.type === getType(interactionActions.addInteraction)) {
    return state.set(String(id), action.payload);
  }

  if (action.type === getType(interactionActions.setInteractionType)) {
    const t = action.payload;
    return state.setIn([String(id), 'interactionType'], t);
  }

  if (action.type === getType(interactionActions.setMappingType)) {
    const t = action.payload;
    return state.setIn([String(id), 'mappingType'], t);
  }

  if (action.type === getType(interactionActions.deleteInteraction)) {
    return state.remove(String(id));
  }

  return state;
}
