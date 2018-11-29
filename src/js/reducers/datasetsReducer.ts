import {ActionType, getType} from 'typesafe-actions';
import * as datasetActions from '../actions/datasetActions';
import {DatasetState} from '../store/factory/Dataset';

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
export function datasetsReducer(state: DatasetState, action: ActionType<typeof datasetActions>) {
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

  // TODO: End of Arvind's typesafe datasetActions refactor.
  const transform = action.transform;

  if (action.type === ACTIONS.SORT_DATASET) {
    return setIn(state, id + '._sort', Immutable.fromJS({
      field: action.field,
      order: action.order
    }));
  }

  if (action.type === ACTIONS.ADD_DATA_TRANSFORM) {
    const transforms = getIn(state, id + '.transform') || Immutable.List();

    if (transform.type === 'formula') {
      state = setIn(state, id + '._schema.' + transform.field,
        Immutable.fromJS({
          name: transform.field,
          type: 'number',
          mtype: MTYPES.QUANTITATIVE,
          source: false
        }));
    }

    return setIn(state, id + '.transform',
      transforms.push(Immutable.fromJS(transform)));
  }

  if (action.type === ACTIONS.UPDATE_DATA_TRANSFORM) {
    if (transform.type === 'formula') {
      const oldName = getIn(state, id + '.transform.' + action.index + '.field'),
          oldSchema = getIn(state, id + '._schema.' + oldName);

      state = state.deleteIn([id + '', '_schema', oldName]);
      state = setIn(state, id + '._schema.' + transform.field, oldSchema);
    }

    return setIn(state, id + '.transform.' + action.index,
      Immutable.fromJS(action.transform));
  }

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
