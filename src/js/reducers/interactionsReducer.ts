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

  if (action.type === getType(interactionActions.setSelection)) {
    const t = action.payload;
    return state.setIn([String(id), 'selectionDef'], t);
  }

  if (action.type === getType(interactionActions.setMapping)) {
    const t = action.payload;
    return state.setIn([String(id), 'mappingDef'], t);
  }

  if (action.type === getType(interactionActions.addWidgetSignals)) {
    const t = action.payload;
    // const interaction = state.getIn(['vis', 'present', 'interactions']);
    // console.log(interaction, "is interactiosn")
    // let widgetSignals = interaction.widgetSignals;
    // const match = widgetSignals.filter(e => e.name == t.name);
    // if(match.length) return state;
    // widgetSignals = [...widgetSignals, t];
    return state.setIn([String(id), 'widgetSignals'], t);
  }

  if (action.type === getType(interactionActions.deleteInteraction)) {
    return state.remove(String(id));
  }

  return state;
}
