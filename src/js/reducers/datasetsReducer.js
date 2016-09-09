/* eslint new-cap:0 */
'use strict';

var Immutable = require('immutable'),
    ACTIONS = require('../actions/Names'),
    immutableUtils = require('../util/immutable-utils'),
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
function datasetsReducer(state, action) {
  var id = action.id,
      transform = action.transform;

  if (typeof state === 'undefined') {
    return Immutable.Map();
  }

  if (action.type === ACTIONS.ADD_DATASET) {
    state = set(state, id, Immutable.fromJS(action.props));
    dsUtil.init(action);
    return state;
  }

  if (action.type === ACTIONS.DELETE_DATASET) {
    return deleteKeyFromMap(state, action.dsId);
  }

  if (action.type === ACTIONS.CHANGE_FIELD_MTYPE) {
    return setIn(state, id + '._schema.' + action.field + '.mtype', action.mtype);
  }

  if (action.type === ACTIONS.SORT_DATASET) {
    return setIn(state, id + '._sort', Immutable.fromJS({
      field: action.field,
      order: action.order
    }));
  }

  if (action.type === ACTIONS.ADD_DATA_TRANSFORM) {
    var transforms = getIn(state, id + '.transform') || Immutable.List();

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
      var oldName = getIn(state, id + '.transform.' + action.index + '.field'),
          oldSchema = getIn(state, id + '._schema.' + oldName);

      state = state.deleteIn([id + '', '_schema', oldName]);
      state = setIn(state, id + '._schema.' + transform.field, oldSchema);
    }

    return setIn(state, id + '.transform.' + action.index,
      Immutable.fromJS(action.transform));
  }

  if (action.type === ACTIONS.SUMMARIZE_AGGREGATE) {
    state = setIn(state, id + '.transform.0.summarize',
      getIn(state, id + '.transform.0.summarize').mergeDeep(action.summarize));

    var src = getIn(state, id + '.source');
    return setIn(state, id + '._schema',
      Immutable.fromJS(dsUtil.aggregateSchema(getIn(state, src + '._schema'),
        getIn(state, id + '.transform.0').toJS())));
  }

  return state;
}

module.exports = datasetsReducer;
