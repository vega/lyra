'use strict';

var Immutable = require('immutable'),
    ACTIONS = require('../actions/Names'),
    immutableUtils = require('../util/immutable-utils'),
    set = immutableUtils.set,
    setIn = immutableUtils.setIn;

function autoCompleteReducer(state, action) {
	if (typeof state === 'undefined') {
   		return Immutable.Map();
    }

    if (action.type === ACTIONS.UPDATE_EXPRESSION) {
    	return setIn(state, action.path, Immutable.fromJS(action.value));
    }
}

module.exports = autoCompleteReducer;
