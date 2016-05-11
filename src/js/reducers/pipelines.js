/* eslint new-cap:0 */
'use strict';

var Immutable = require('immutable');

var actions = require('../constants/actions');
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
    return  Immutable.fromJS({
      names: [],
      sources: []
    });
  }

  var names = state.get("names")
  var sources = state.get("sources");

  if (action.type === actions.CREATE_PIPELINE) {
    var newNames = names.push(action.id);
    var newSources = sources.push(null);
    return Immutable.Map({
      names: newNames,
      sources: newSources
    });
  }

  if (action.type === actions.UPDATE_PIPELINE_DATASET) {
    var nameIndex = names.indexOf(action.pipelineId);
    if (nameIndex == -1) {
      console.log("SHOULDN'T HAPPENR IGHT NOW");
    }
    var newSources = sources.set(nameIndex, action.datasetId);
    return Immutable.fromJS({
      names: names,
      sources: newSources
    });
  }

  return state;
}

module.exports = pipelinesReducer;
