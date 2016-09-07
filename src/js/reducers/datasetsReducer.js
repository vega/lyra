/* eslint new-cap:0 */
'use strict';

var Immutable = require('immutable'),
    ACTIONS = require('../actions/Names'),
    immutableUtils = require('../util/immutable-utils'),
    set   = immutableUtils.set,
    setIn = immutableUtils.setIn,
    getIn = immutableUtils.getIn,
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
  var id = action.id;

  if (typeof state === 'undefined') {
    return Immutable.Map();
  }

  if (action.type === ACTIONS.ADD_DATASET) {
    state = set(state, id, Immutable.fromJS(action.props));
    dsUtil.init(action);
    return state;
  }

  if (action.type === ACTIONS.SORT_DATASET) {
    return setIn(state, id + '._sort', Immutable.fromJS({
      field: action.field,
      order: action.order
    }));
  }

  if (action.type === ACTIONS.FILTER_DATASET) {
    state = setIn(state, action.id + '._filter',
    Immutable.fromJS({
      expression: action.expression
    }));
  }

  if (action.type === ACTIONS.ADD_DATA_TRANSFORM) {
    var transforms = getIn(state, action.id + '._transforms');

    if (!transforms) {
      transforms = [];
    }
    var result = transforms.indexOf(action.transformSpec);
    if (transforms.indexOf(action.transformSpec) === -1) {
      // if transform doesn't exist already
      transforms.push(action.transformSpec);
    }

    state = setIn(state, action.id + '._transforms', transforms);
  }

  if (action.type === ACTIONS.EDIT_DATA_TRANSFORM) {
    var transforms = getIn(state, action.id + '._transforms');

    if (!transforms) {
      transforms = [];
    }
    var index = action.specId;
    if (index > -1) {
      // if transform exist already
      transforms[index] = action.newSpec;
    }
    state = setIn(state, action.id + '._transforms', transforms);
  }

  if (action.type === ACTIONS.SUMMARIZE_AGGREGATE) {
    state = setIn(state, id + '.transform.0.summarize',
      getIn(state, id + '.transform.0.summarize').mergeDeep(action.summarize));
    dsUtil.schema(id, dsUtil.aggregateSchema(getIn(state, id + '.source'),
      getIn(state, id + '.transform.0').toJS()));
    return state;
  }

  return state;
}

module.exports = datasetsReducer;
