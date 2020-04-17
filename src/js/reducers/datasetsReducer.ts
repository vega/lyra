import {List, Map} from 'immutable';
import {ActionType, getType} from 'typesafe-actions';
import {QUANTITATIVE} from 'vega-lite/src/type';
import {Transforms} from 'vega-typings/types';
import * as datasetActions from '../actions/datasetActions';
import {Column, ColumnRecord, DatasetState} from '../store/factory/Dataset';
import * as dsUtil from '../util/dataset-utils';

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

  if (action.type === getType(datasetActions.baseAddDataset)) {
    if (action.meta) {
      dsUtil.init(action.payload, action.meta);
    }
    return state.set(String(action.payload._id), action.payload);
  }

  if (action.type === getType(datasetActions.deleteDataset)) {
    return state.remove(String(id));
  }

  if (action.type === getType(datasetActions.changeFieldMType)) {
    const p = action.payload;
    return state.setIn([String(id), '_schema', p.field, 'mtype'], p.mtype);
  }

  if (action.type === getType(datasetActions.sortDataset)) {
    return state.setIn([String(id), '_sort'], action.payload);
  }

  if (action.type === getType(datasetActions.addTransform)) {
    const transform = action.payload;

    const transforms: Transforms[] = state.getIn([String(id), 'transform']) || List();

    if (transform.type === 'formula') {
      state = state.setIn(
        [String(id), '_schema', transform.as],
        Column({
          name: transform.as as string,
          type: 'number',
          mtype: QUANTITATIVE,
          source: false
        })
      );
    }

    return state.setIn([String(id), 'transform'], transforms.concat(transform));
  }

  if (action.type === getType(datasetActions.updateTransform)) {
    const p = action.payload;
    const transform = p.transform;

    if (transform.type === 'formula') {
      const oldName = state.getIn([String(id), 'transform', p.index, 'as']);
      const oldSchema: ColumnRecord = state.getIn([String(id), '_schema', oldName]);
      state = state.deleteIn([String(id), '_schema', oldName]);
      state = state.setIn([String(id), '_schema', transform.as],
        oldSchema.set('name', transform.as as string));
    }

    return state.setIn([String(id), 'transform', p.index], p.transform);
  }

  if (action.type === getType(datasetActions.summarizeAggregate)) {
    state = state.setIn(
      [String(id), 'transform', '0', 'fields'],
      state.getIn([String(id), 'transform', '0', 'fields']).concat(action.payload.fields)
    );
    state = state.setIn(
      [String(id), 'transform', '0', 'ops'],
      state.getIn([String(id), 'transform', '0', 'ops']).concat(action.payload.ops)
    );
    state = state.setIn(
      [String(id), 'transform', '0', 'as'],
      state.getIn([String(id), 'transform', '0', 'as']).concat(action.payload.as)
    );

    const src = state.getIn([String(id), 'source']);
    return state.setIn(
      [String(id), '_schema'],
      dsUtil.aggregateSchema(state.getIn([src, '_schema']), state.getIn([String(id), 'transform', '0']))
    );
  }

  return state;
}
