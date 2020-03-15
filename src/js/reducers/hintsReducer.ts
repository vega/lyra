import {ActionType, getType} from 'typesafe-actions';
import * as hintActions from '../actions/hintActions';
import * as markActions from '../actions/markActions';
import * as sceneActions from '../actions/sceneActions';
import {MarkHints} from '../hints/mark-hints';
import {SceneHints} from '../hints/scene-hints';
import {Hints, HintsRecord} from '../store/factory/Hints';

/**
 * Hints
 * To keep this organized, the actual hints text and template references are stored in the
 * 'hints' folder at js root level.
 *
 * The Hints reducer contains listeners for 2 hints specific actions,
 * and listeners on other application actions
 *
 * CLEAR_HINTS - sets 'display' to null
 * HINTS_ON - boolean to determine if hints are shown in the app
 *
 * Listeners for other actions in the app which will set 'display' with
 * a custom object that will determine what is shown in the hints box.
 *
 * The display object should look something like this:
 *
 *  {
 *    title: 'title text for the hint',
 *    text: 'longer explanation,
 *    action_text: 'Button text',
 *    action: require('../actions/clearScene'), // callback for the button's onClick event
 *    action_props: true // any properties that will be passed in the action event
 *  }
 *
 *  or you can pass a custom template to be shown instead
 *
 *  {
 *    template: require('../components/hints/custom-hint')
 *  }
 */


export function hintsReducer(state: HintsRecord, action: ActionType<typeof hintActions | typeof sceneActions | typeof markActions>): HintsRecord {
  if (typeof state === 'undefined') {
    return Hints();
  }

  if (action.type === getType(hintActions.clearHints)) {
    return state.set('display', null);
  }

  if (action.type === getType(hintActions.hintsOn)) {
    return state.set('on', action.payload);
  }

  if (action.type === getType(sceneActions.createScene)) {
    return state.set('display', SceneHints.CREATE_SCENE);
  }

  if (action.type === getType(markActions.addMark)) {
    const markType = action.payload.props.type;
    if (MarkHints.ADD_MARK[markType]) {
      return state.set('display', MarkHints.ADD_MARK[markType]);
    }
  }

  return state;
}
