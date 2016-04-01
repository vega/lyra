'use strict';

var Immutable = require('immutable');

var actions = require('../constants/actions');
var getIn = require('../util/immutable-utils').getIn;
var setIn = require('../util/immutable-utils').setIn;

function primitivesReducer(state, action) {
  if (typeof state === 'undefined') {
    return new Immutable.Map();
  }

  if (action.type === actions.ADD_PRIMITIVE) {
    return state;
  }

  return state;
}

module.exports = primitivesReducer;
