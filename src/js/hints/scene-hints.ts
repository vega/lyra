import * as hintActions from '../actions/hintActions';
import {HintsDisplay} from '../store/factory/Hints';

/**
 * Scene Hints
 * These hints are listening to scene related actions
 * If you are creating simple hints that are just text and a simple action,
 * use the title, text, action, action_text, and action_props fields.
 *
 * If you need more custom functionality, create a template in /components/hints
 * and include it as a template.
 */

export const SceneHints: {[x: string]: HintsDisplay} = {
  CREATE_SCENE: {
    title: 'Hi, I\'m helpy the helper hints box',
    text: 'You can turn me on and off. You can manage this in the settings link in the footer.',
    action_text: 'DISABLE HINTS',
    action: hintActions.hintsOn,
    action_props: false
  }
};
