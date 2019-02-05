import {List, Map} from 'immutable';
import {ActionType, getType} from 'typesafe-actions';
import {Type as MTYPES} from 'vega-lite/src/type';
import {Transform} from 'vega-typings/types';
import * as datasetActions from '../actions/datasetActions';
import {Column, DatasetState} from '../store/factory/Dataset';
import * as dsUtil from '../util/dataset-utils';

const str   = require('../util/immutable-utils').str;

/**
 * Main datasets reducer function, which generates a new state for the
 * datasets property store based on the changes specified by the dispatched
 * action object.
 *
 * @param {Object} state - An Immutable.Map state object
 * @param {Object} action - A redux action object
 * @returns {Object} A new Immutable.Map with the changes specified by the action
 */
export function datasetsReducer(state: DatasetState, action: ActionType<typeof datasetActions>): DatasetState {
  const id = action.meta;

  if (typeof state === 'undefined') {
    return Map();
  }

  if (action.type === getType(datasetActions.addDataset)) {
    return state.set(str(id), action.payload);
  }

  if (action.type === getType(datasetActions.deleteDataset)) {
    return state.remove(str(id));
  }

  if (action.type === getType(datasetActions.changeFieldMType)) {
    const p = action.payload;
    return state.setIn([str(id), '_schema', p.field, 'mtype'], p.mtype);
  }

  if (action.type === getType(datasetActions.sortDataset)) {
    return state.setIn([str(id), '_sort'], action.payload);
  }

  if (action.type === getType(datasetActions.addTransform)) {
    const transform = action.payload;

    const transforms: Transform[] = state.getIn([str(id), 'transform']) || List();

    if (transform.type === 'formula') {
      state = state.setIn([str(id), '_schema', transform.as],
        Column({
          name: transform.as,
          type: 'number',
          mtype: MTYPES.QUANTITATIVE,
          source: false
        }));
    }

    return state.setIn([str(id), 'transform'],
      transforms.push(transform));
  }

  if (action.type === getType(datasetActions.updateTransform)) {
    const p = action.payload;
    const transform = p.transform;

    if (transform.type === 'formula') {
      const oldName = state.getIn([str(id), 'transform', p.index, 'field']);
      const oldSchema = state.getIn([str(id), '_schema', oldName]);

      state = state.deleteIn([str(id), '_schema', oldName]);
      state = state.setIn([str(id), '_schema', transform.as], oldSchema);
    }

    return state.setIn([str(id), 'transform', p.index], p.transform);
  }

  if (action.type === getType(datasetActions.summarizeAggregate)) {
    state = state.setIn([str(id), 'transform', '0', 'fields'],
      state.getIn([str(id), 'transform', '0', 'fields']).concat(action.payload.fields));
    state = state.setIn([str(id), 'transform', '0', 'ops'],
      state.getIn([str(id), 'transform', '0', 'ops']).concat(action.payload.ops));
    state = state.setIn([str(id), 'transform', '0', 'as'],
      state.getIn([str(id), 'transform', '0', 'as']).concat(action.payload.as));

    const src = state.getIn([str(id), 'source']);
    return state.setIn([str(id), '_schema'],
      dsUtil.aggregateSchema(state.getIn([src, '_schema']),
        state.getIn([str(id), 'transform', '0'])));
  }

  return state;
}
