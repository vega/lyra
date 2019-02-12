import {Map} from 'immutable';
import {ActionType, getType} from 'typesafe-actions';
import * as pipelineActions from '../actions/pipelineActions';
import {PipelineState} from '../store/factory/Pipeline';

const str   = require('../util/immutable-utils').str;

/**
 * Main pipelines reducer function, which generates a new state for the
 * pipelines property store based on the changes specified by the dispatched
 * action object.
 *
 * @param {Object} state - An Immutable.Map state object
 * @param {Object} action - A redux action object
 * @returns {Object} A new Immutable.Map with the changes specified by the action
 */
export function pipelinesReducer(state: PipelineState, action: ActionType<typeof pipelineActions>): PipelineState {
  const id = action.meta;

  if (typeof state === 'undefined') {
    return Map();
  }

  if (action.type === getType(pipelineActions.baseAddPipeline)) {
    return state.set(str(id), action.payload);
  }

  if (action.type === getType(pipelineActions.updatePipelineProperty)) {
    const p = action.payload;
    return state.setIn([str(id), p.property], p.value);
  }

  if (action.type === getType(pipelineActions.baseAggregatePipeline)) {
    const p = action.payload;
    return state.setIn([id, '_aggregates', p.key], p.dsId);
  }

  // TODO: this code is unused
  /*
  if (action.type === ACTIONS.DELETE_DATASET) {
    const plId = action.plId,
        dsId = action.dsId;

    if (getIn(state, plId + '._source') === dsId) {
      throw Error('Cannot delete a pipeline\' source dataset.');
    }

    const key = getIn(state, plId + '._aggregates').findKey(function(aggId) {
      return aggId === dsId;
    });

    return state.deleteIn([plId + '', '_aggregates', key]);
  }
  */

  return state;
}
