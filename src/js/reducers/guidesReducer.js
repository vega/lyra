/* eslint new-cap:0 */
'use strict';

var dl = require('datalib'),
    Immutable = require('immutable'),
    ACTIONS = require('../actions/Names'),
    convertValuesToSignals = require('../util/prop-signal').convertValuesToSignals,
    immutableUtils = require('../util/immutable-utils'),
    set = immutableUtils.set,
    setIn = immutableUtils.setIn,
    deleteKeyFromMap = immutableUtils.deleteKeyFromMap;

function makeGuide(action) {
  var def = action.props,
      props = def.properties;

  return Immutable.fromJS(dl.extend({}, def, {
    properties: Object.keys(props).reduce(function(converted, name) {
      converted[name] = convertValuesToSignals(props[name], 'guide', action.id, name);
      return converted;
    }, {})
  }));
}

function guideReducer(state, action) {
  if (typeof state === 'undefined') {
    return Immutable.Map();
  }

  if (action.type === ACTIONS.ADD_GUIDE) {
    return set(state, action.id, makeGuide(action));
  }

  if (action.type === ACTIONS.DELETE_GUIDE) {
    return deleteKeyFromMap(state, action.id);
  }

  if (action.type === ACTIONS.UPDATE_GUIDE_PROPERTY) {
    return setIn(state, action.id + '.' + action.property,
      Immutable.fromJS(action.value));
  }

  if (action.type === ACTIONS.DELETE_SCALE) {
    return deleteKeyFromMap(state, action.id);
  }

  return state;
}

module.exports = guideReducer;
