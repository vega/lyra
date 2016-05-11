/* eslint new-cap:0 */
'use strict';

var Immutable = require('immutable');

var actions = require('../constants/actions');
var counter = require('../util/counter');
var immutableUtils = require('../util/immutable-utils');
var get = immutableUtils.get;
var getIn = immutableUtils.getIn;
var set = immutableUtils.set;
var setIn = immutableUtils.setIn;
var ensureValuePresent = immutableUtils.ensureValuePresent;
var ensureValueAbsent = immutableUtils.ensureValueAbsent;
var assign = require('object-assign');


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
    return Immutable.fromJS({
      pipelines: []
    });
  }

  var pipelines = state.get("pipelines")

  if (action.type === actions.CREATE_PIPELINE) {
    var newPipelines = pipelines.push(Immutable.fromJS({
      name: action.id,
      id: counter.type("pipeline"),
      source: null
    }));
    return Immutable.fromJS({
      pipelines: newPipelines
    });
  }

  if (action.type === actions.UPDATE_PIPELINE_DATASET) {
    var newPipelines = pipelines;
    var index = -1;
    for (var i = 0; i < pipelines.size; i++) {
      if (pipelines.get(i).get("name") == action.pipelineId) {
        index = i;
      }
    }
    if (index == -1) {
      newPipelines = pipelines.push(Immutable.fromJS({
        name: action.pipelineId,
        id: counter.type("pipeline"),
        source: action.datasetId
      }));
    } else {
      var newMap = pipelines.get(index).set("source", action.datasetId);
      newPipelines = pipelines.set(index, newMap);
    }
    return Immutable.fromJS({
      pipelines: newPipelines
    });

  }

  return state;
}

module.exports = pipelinesReducer;
