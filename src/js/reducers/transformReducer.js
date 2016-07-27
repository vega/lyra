/* eslint new-cap:0 */
'use strict';

var Immutable = require('immutable'),
    ACTIONS = require('../actions/Names'),
    immutableUtils = require('../util/immutable-utils'),
    set   = immutableUtils.set,
    setIn = immutableUtils.setIn;

// add commments here later

function transformReducer(state, action) {
  if (typeof state == 'undefined') {
    return Immutable.Map();
  }

  switch (action.type) {
    case 'TRANSFORM_SORT':
      state = set(state, 'sort', Immutable.fromJS(action.data));
      console.log(state);
  }

  return state;
}

module.exports = transformReducer;
