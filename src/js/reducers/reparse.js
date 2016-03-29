/* eslint new-cap:0 */
'use strict';

var Immutable = require('immutable');

var actions = require('../constants/actions');
var getIn = require('../util/immutable-utils').getIn;
var setIn = require('../util/immutable-utils').setIn;

/**
 * This reducer handles whether to recreate the view from the lyra model.
 * @param {boolean} state - The existing model reparse value from the store
 * @param {Object} action - The dispatched action indicating how to modify
 * the reparse flag within the store.
 * @return {boolean} The new state of the reparse flag
 */
function reparseModelReducer(state, action) {
  if (typeof state === 'undefined') {
    return false;
  }

  if (action.type === actions.REPARSE_MODEL && typeof action.value === 'boolean') {
    console.log('requested a reparse, setting value as ' + action.value);
    return action.value;
  }

  return state;
}

module.exports = reparseModelReducer;
