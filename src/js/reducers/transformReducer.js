/* eslint new-cap:0 */
'use strict';

var Immutable = require('immutable'),
    ACTIONS = require('../actions/Names'),
    immutableUtils = require('../util/immutable-utils'),
    set   = immutableUtils.set,
    setIn = immutableUtils.setIn,
    dsUtil = require('../util/dataset-utils');

// add commments here later

function transformReducer(state, action) {
  if (typeof state == 'undefined') {
    return Immutable.Map();
  }

  // switch (action.transform) {
  //   case 'SORT':
  //     console.log("works");
  //
  //   default:
  //     console.log('default');
  // }
  return state;
}

module.export = transformReducer;
