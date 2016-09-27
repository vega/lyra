/* eslint new-cap:0 */
'use strict';

var dl = require('datalib'),
    Immutable = require('immutable'),
    ACTIONS = require('../actions/Names'),
    GTYPES = require('../store/factory/Guide').GTYPES,
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
    var scaleId = +action.id;
    return state.withMutations(function(newState) {
      state.forEach(function(def, guideId) {
        var gtype = def.get('_gtype'),
            scale;

        if (gtype === GTYPES.AXIS) {
          scale = def.get('scale');
        } else if (gtype === GTYPES.LEGEND) {
          scale = def.get(def.get('_type'));
        }

        if (scale === scaleId) {
          deleteKeyFromMap(newState, guideId);
        }
      });
    });
  }

  return state;
}

module.exports = guideReducer;
