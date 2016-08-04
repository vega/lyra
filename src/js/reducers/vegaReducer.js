/* eslint new-cap:0 */
'use strict';

var Immutable = require('immutable');

var ACTIONS = require('../actions/Names');

/**
 * This reducer handles whether to recreate the view from the lyra ctrl.
 * @param {boolean} state - The existing ctrl reparse value from the store
 * @param {Object} action - The dispatched action indicating how to modify
 * the reparse flag within the store.
 * @returns {boolean} The new state of the reparse flag
 */
function invalidateVegaReducer(state, action) {
  if (typeof state === 'undefined') {
    return Immutable.Map({
      invalid: false,
      isParsing: false,
    });
  }

  if (action.type === ACTIONS.INVALIDATE_VEGA) {
    return state.set('invalid', action.value);
  }

  // All of these actions implicitly invalidate the view
  var invalidatingActions = [
    ACTIONS.CREATE_SCENE,
    ACTIONS.INIT_SIGNAL,
    ACTIONS.ADD_MARK,
    ACTIONS.DELETE_GUIDE,
    ACTIONS.DELETE_MARK,
    ACTIONS.SET_PARENT_MARK,
    ACTIONS.UPDATE_MARK_PROPERTY,
    ACTIONS.SET_MARK_VISUAL,
    ACTIONS.DISABLE_MARK_VISUAL,
    ACTIONS.RESET_MARK_VISUAL,
    ACTIONS.BIND_SCALE,
    ACTIONS.ADD_SCALE,
    ACTIONS.UPDATE_SCALE_PROPERTY,
    ACTIONS.ADD_SCALE_TO_GROUP,
    ACTIONS.ADD_GUIDE,
    ACTIONS.UPDATE_GUIDE_PROPERTY,
    ACTIONS.ADD_AXIS_TO_GROUP,
    ACTIONS.ADD_LEGEND_TO_GROUP,
    ACTIONS.REMOVE_AXIS_FROM_GROUP,
    ACTIONS.SORT_DATASET
  ];
  if (invalidatingActions.indexOf(action.type) >= 0) {
    return state.set('invalid', true);
  }

  if (action.type === ACTIONS.PARSE_VEGA) {
    return state.merge({
      isParsing: action.value,
      // Toggle this back to false now that the parse is in progress (or done)
      invalid: false
    });
  }

  return state;
}

module.exports = invalidateVegaReducer;
