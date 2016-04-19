'use strict';
/**
 * Scene Hints
 * These hints are listening to scene related actions
 */

/** @namespace */
var SceneHints = {
  CREATE_SCENE : {
    title: 'Hi, I\'m helpy the helper hints box',
    text: 'You can turn me on and off. If you ever disable me and want to turn me back on. You can do so under the settings link in the footer.',
    action_text: 'DISABLE HINTS',
    action: require('../actions/hintActions').on,
    action_props: false
  }
};

module.exports = SceneHints;
