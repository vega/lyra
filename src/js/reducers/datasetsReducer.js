/* eslint new-cap:0 */
'use strict';

var Immutable = require('immutable'),
    ACTIONS = require('../actions/Names'),
    immutableUtils = require('../util/immutable-utils'),
    set   = immutableUtils.set,
    setIn = immutableUtils.setIn,
    dsUtil = require('../util/dataset-utils');

/**
 * Main datasets reducer function, which generates a new state for the
 * datasets property store based on the changes specified by the dispatched
 * action object.
 *
 * @param {Object} state - An Immutable.Map state object
 * @param {Object} action - A redux action object
 * @returns {Object} A new Immutable.Map with the changes specified by the action
 */
function datasetsReducer(state, action) {
  if (typeof state === 'undefined') {
    return Immutable.Map();
  }

  if (action.type === ACTIONS.ADD_DATASET) {
    state = set(state, action.id, Immutable.fromJS(action.props));
    dsUtil.init(action);
    return state;
  }

  if (action.type === ACTIONS.INIT_DATASET) {
    return setIn(state, action.id + '._init', true);
  }

  if (action.type === ACTIONS.SORT_DATASET) {
    return setIn(state, action.id + '._sort', Immutable.fromJS({
      sortField: action.sortField,
      sortOrder: action.sortOrder
    }));
  }

  return state;
}

module.exports = datasetsReducer;
