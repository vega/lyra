/* eslint new-cap:0 */
'use strict';

var Immutable = require('immutable');

var actions = require('../constants/actions');

/**
 * This reducer handles whether to recreate the view from the lyra model.
 * @param {boolean} state - The existing model reparse value from the store
 * @param {Object} action - The dispatched action indicating how to modify
 * the reparse flag within the store.
 * @returns {boolean} The new state of the reparse flag
 */
function vegaInvalidateReducer(state, action) {
  if (typeof state === 'undefined') {
    return Immutable.Map({
      invalid: false,
      isParsing: false,
    });
  }

  if (action.type === actions.VEGA_INVALIDATE) {
    return state.set('invalid', action.value);
  }

  // All of these actions implicitly invalidate the view
  var invalidatingActions = [
    actions.CREATE_SCENE,
    actions.INIT_SIGNAL,
    actions.PRIMITIVE_ADD_MARK
  ];
  if (invalidatingActions.indexOf(action.type) >= 0) {
    return state.set('invalid', true);
  }

  if (action.type === actions.VEGA_PARSE) {
    return state.merge({
      isParsing: action.value,
      // Toggle this back to false now that the parse is in progress (or done)
      invalid: false
    });
  }

  return state;
}

module.exports = vegaInvalidateReducer;
