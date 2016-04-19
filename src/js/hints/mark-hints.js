'use strict';
/**
 * Mark kinds
 * This hints are triggered on MARK actions in the hints reducer
 */

/** @namespace */
var MarkHints = {
  MARK_ADD: {
    rect: {
      title: 'I see you have added a RECT...',
      text: 'Maybe you\'d like to clear the whole canvas',
      action_text: 'DO IT. CLEAR IT OUT.',
      action: require('../actions/sceneClear')
    },
    line: {
      title: 'I see you have added a LINE...',
      text: 'Maybe you\'d like to clear the whole canvas after adding that line cause I said so.',
      action_text: 'Lets make a cool RECT thing with some properties.',
      action: require('../actions/markActions').addMark,
      action_props: require('../model/primitives/marks').getDefaults('rect')
    }
  }
};

module.exports = MarkHints;
