/* eslint new-cap:0 */
'use strict';

var Immutable = require('immutable'),
    ACTIONS = require('../actions/Names'),
    immutableUtils = require('../util/immutable-utils'),
    set   = immutableUtils.set,
    setIn = immutableUtils.setIn,
    getIn = immutableUtils.getIn,
    dl = require('datalib'),
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

  if (action.type === ACTIONS.SORT_DATASET) {
    state = setIn(state, action.id + '._sort', Immutable.fromJS({
      field: action.field,
      order: action.order
    }));

  }

  if (action.type === ACTIONS.ADD_TO_SUMMARIZE) {
    var id = action.id,
        summarize = action.summarize,
        propPath = id + '.transform.0.summarize',
        mergedSummarize = getIn(state, propPath).mergeDeep(Immutable.fromJS(summarize));

    return setIn(state, propPath, mergedSummarize);
  }

  return state;
}

module.exports = datasetsReducer;
