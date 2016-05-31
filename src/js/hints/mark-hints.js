'use strict';

/**
 * Mark kinds
 * This hints are triggered on MARK actions in the hints reducer
 * If you are creating simple hints that are just text and a simple action,
 * use the title, text, action, action_text, and action_props fields.
 *
 * If you need more custom functionality, create a template in /components/hints
 * and include it as a template.
 */

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
      text: 'Drop data on it to create a graph.',
    },

    symbol: {
      template: require('../components/hints/symbol-hint')
    }
  }
};

module.exports = MarkHints;
