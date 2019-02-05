import {PipelineState} from '../store/factory/Pipeline';

/* eslint new-cap:0 */
'use strict';

var Immutable = require('immutable'),
    ACTIONS = require('../actions/Names'),
    imutils = require('../util/immutable-utils'),
    getIn = imutils.getIn,
    set = imutils.set,
    setIn = imutils.setIn;

/**
 * Main pipelines reducer function, which generates a new state for the
 * pipelines property store based on the changes specified by the dispatched
 * action object.
 *
 * @param {Object} state - An Immutable.Map state object
 * @param {Object} action - A redux action object
 * @returns {Object} A new Immutable.Map with the changes specified by the action
 */
function pipelinesReducer(state, action): PipelineState {
  if (typeof state === 'undefined') {
    return Immutable.Map();
  }

  if (action.type === ACTIONS.ADD_PIPELINE) {
    return set(state, action.id, Immutable.fromJS(action.props));
  }

  if (action.type === ACTIONS.UPDATE_PIPELINE_PROPERTY) {
    return setIn(state, action.id + '.' + action.property,
      Immutable.fromJS(action.value));
  }

  if (action.type === ACTIONS.AGGREGATE_PIPELINE) {
    return setIn(state, action.id + '._aggregates.' + action.key, action.dsId);
  }

  if (action.type === ACTIONS.DELETE_DATASET) {
    var plId = action.plId,
        dsId = action.dsId;

    if (getIn(state, plId + '._source') === dsId) {
      throw Error('Cannot delete a pipeline\' source dataset.');
    }

    var key = getIn(state, plId + '._aggregates').findKey(function(aggId) {
      return aggId === dsId;
    });

    return state.deleteIn([plId + '', '_aggregates', key]);
  }

  return state;
}

module.exports = pipelinesReducer;
