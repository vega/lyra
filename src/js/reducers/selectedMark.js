'use strict';

function selectedMarkReducer(state, action) {
  if (typeof state === 'undefined') {
    return null;
  }
  if (action.type !== 'SELECT_MARK') {
    return state;
  }
  return action.markId;
}

module.exports = selectedMarkReducer;
