'use strict';

/**
 * Hints Rules
 * Hints are triggered by listening to redux actions in the app. They give the user more information and additional actions
 * they can preform in the app.
 */

/** @namespace */
var Hints = {
  CREATE_SCENE: {
    text: 'Blah blah blah blah blah',
    action_text: 'Do this',
    action: 'CLEAR_SCENE'
  }
};

module.exports = Hints;
