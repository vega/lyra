/* eslint new-cap:0 */
'use strict';

var Immutable = require('immutable');

var actions = require('../constants/actions');

/**
 * This reducer handles whether to recreate the view from the lyra model.
 * @param {boolean} state - The existing model reparse value from the store
 * @param {Object} action - The dispatched action indicating how to modify
 * the reparse flag within the store.
 * @return {boolean} The new state of the reparse flag
 */
function reparseModelReducer(state, action) {
  if (typeof state === 'undefined') {
    return Immutable.Map({
      reparseModel: false,
      isParsing: false,
    });
  }

  if (action.type === actions.REPARSE_MODEL) {
    return state.set('reparseModel', action.value);
  }

  if (action.type === actions.PARSE_START) {
    return state.merge({
      isParsing: true,
      // Toggle this back to false now that the parse is in progress
      reparseModel: false
    });
  }

  if (action.type === actions.PARSE_COMPLETE) {
    return state.set('isParsing', false);
  }

  return state;
}

module.exports = reparseModelReducer;
