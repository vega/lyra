import {ActionType, getType} from 'typesafe-actions';
import {Transform} from 'vega-typings/types';
import * as datasetActions from '../actions/datasetActions';
import {Column, DatasetState} from '../store/factory/Dataset';

const Immutable = require('immutable'),
    ACTIONS = require('../actions/Names'),
    immutableUtils = require('../util/immutable-utils'),
    str   = immutableUtils.str,
    set   = immutableUtils.set,
    setIn = immutableUtils.setIn,
    getIn = immutableUtils.getIn,
    deleteKeyFromMap = immutableUtils.deleteKeyFromMap,
    dsUtil = require('../util/dataset-utils'),
    MTYPES = require('../constants/measureTypes');

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
    return Immutable.Map();
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

    const transforms: Transform[] = state.getIn([str(id), 'transform']) || Immutable.List();

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

  // TODO: End of Arvind's typesafe datasetActions refactor.
  // Summarize is outdated in the latest Vega.
  const transform = action.transform;

  if (action.type === ACTIONS.SUMMARIZE_AGGREGATE) {
    state = setIn(state, id + '.transform.0.summarize',
      getIn(state, id + '.transform.0.summarize')
        .mergeWith(function(prev, next) {
          return prev.toSet().merge(next);
        }, action.summarize));

    const src = getIn(state, id + '.source');
    return setIn(state, id + '._schema',
      Immutable.fromJS(dsUtil.aggregateSchema(getIn(state, src + '._schema').toJS(),
        getIn(state, id + '.transform.0').toJS())));
  }

  return state;
}
