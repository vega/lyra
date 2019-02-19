import {ActionType, getType} from 'typesafe-actions';
import * as walkthroughActions from '../actions/walkthroughActions';
import {Walkthrough, WalkthroughRecord} from '../store/factory/Walkthrough';

export function walkthroughReducer(state: WalkthroughRecord, action: ActionType<typeof walkthroughActions>): WalkthroughRecord {
  if (typeof state === 'undefined') {
    return Walkthrough();
  }

  if (action.type === getType(walkthroughActions.setActiveStep)) {
    return state.set('activeStep', action.payload);
  }

  if (action.type === getType(walkthroughActions.setActiveWalkthrough)) {
    return state.set('activeWalkthrough', action.payload);
  }

  // if (action.type === actions.SET_WALKTHROUGH) {
  //   return state.set(action.key, dl.extend({}, state.get(action.key), action.data));
  // }

  return state;
}
