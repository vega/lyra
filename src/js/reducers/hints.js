/* eslint new-cap:0 */
'use strict';

var Immutable = require('immutable');
var actions = require('../constants/actions');

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
 *    text: 'longer explaination,
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


function hintsReducer(state, action) {
  if (typeof state === 'undefined') {
    return Immutable.fromJS({
      display: null,
      on: false
    });
  }

  if (action.type === actions.CLEAR_HINTS) {
    return state.set('display', null);
  }

  if (action.type === actions.HINTS_ON) {
    return state.set('on', action.on);
  }

  if (action.type === actions.CREATE_SCENE) {
    var sceneHints = require('../hints/scene-hints');
    return state.set('display', sceneHints.CREATE_SCENE);
  }

  if (action.type === actions.ADD_MARK) {
    var hintMap = require('../hints/mark-hints'),
        markType = action.props.type;
    if (hintMap.ADD_MARK[markType]) {
      return state.set('display', hintMap.ADD_MARK[markType]);
    }
  }

  return state;
}

module.exports = hintsReducer;
