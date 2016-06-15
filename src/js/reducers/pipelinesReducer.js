/* eslint new-cap:0 */
'use strict';

var Immutable = require('immutable');

var actions = require('../actions/Names');
var counter = require('../util/counter');
var immutableUtils = require('../util/immutable-utils');
var set = immutableUtils.set;
var setIn = immutableUtils.setIn;

/**
 * Main pipelines reducer function, which generates a new state for the
 * pipelines (pipelines) property store based on the changes specified by the
 * dispatched action object.
 *
 * @param {Object} state - An Immutable.Map state object
 * @param {Object} action - A redux action object
 * @returns {Object} A new Immutable.Map with the changes specified by the action
 */
function pipelinesReducer(state, action) {
  if (typeof state === 'undefined') {
    return Immutable.Map();
  }

  if (action.type === actions.CREATE_PIPELINE) {
    var newId = counter.type('pipeline');
    return set(state, newId, Immutable.fromJS({
      _name: action.id,
      _id: newId,
      source: null
    }));
  }

  if (action.type === actions.UPDATE_PIPELINE_DATASET) {
    // TODO handle nonexistent pipeline id
    return setIn(state, action.pipelineId + '.source', action.datasetId);
  }

  return state;
}

module.exports = pipelinesReducer;
