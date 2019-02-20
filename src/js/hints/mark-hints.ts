import * as sceneActions from '../actions/sceneActions';
import {HintsDisplay} from '../store/factory/Hints';
import {LyraMarkType} from '../store/factory/Mark';

/**
 * Mark kinds
 * This hints are triggered on MARK actions in the hints reducer
 * If you are creating simple hints that are just text and a simple action,
 * use the title, text, action, action_text, and action_props fields.
 *
 * If you need more custom functionality, create a template in /components/hints
 * and include it as a template.
 */

export const MarkHints: {[x: string]: {[t: string]: HintsDisplay}} = {
  ADD_MARK: {
    rect: {
      title: 'I see you have added a RECT...',
      text: 'Maybe you\'d like to clear the whole canvas',
      action_text: 'DO IT. CLEAR IT OUT.',
      action: sceneActions.clearScene
    },

    line: {
      title: 'I see you have added a LINE...',
      text: 'Drop data on it to create a graph.',
    },

    symbol: {
      template: require('../components/hints/symbol-hint')
    }
  }
};
