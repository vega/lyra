import {GuideState, GuideRecord} from "../store/factory/Guide";
import * as guideActions from '../actions/guideActions';
import {ActionType, getType} from 'typesafe-actions';
import {Map, fromJS} from 'immutable';
import {AxisEncode, LegendEncode} from "vega-typings/types";


const str = require('../util/immutable-utils').str;
const convertValuesToSignals = require('../util/prop-signal').convertValuesToSignals;

function makeGuide(action : ActionType<typeof guideActions.addGuide>): GuideRecord {
  const def: GuideRecord = action.payload;
  const props = def.encode;

  return (def as any).merge({
    encode: Object.keys(props).reduce(function(converted, name) {
      converted[name] = convertValuesToSignals(props[name], 'guide', def._id, name);
      return converted;
    }, {})
  });
}

export function guideReducer(state: GuideState, action: ActionType<typeof guideActions>): GuideState {
  const id = action.meta;

  if (typeof state === 'undefined') {
    return Map();
  }

  if (action.type === getType(guideActions.addGuide)) {
    return state.set(str(id), makeGuide(action));
  }

  if (action.type === getType(guideActions.deleteGuide)) {
    return state.remove(str(id));
  }

  if (action.type === getType(guideActions.updateGuideProperty)) {
    return state.setIn([str(id), action.payload.property], fromJS(action.payload.value));
  }

  // TODO: Figure out where this action came from? Not in guideActions.ts
  // if (action.type === ACTIONS.DELETE_SCALE) {
  //   var scaleId = +action.id;
  //   return state.withMutations(function(newState) {
  //     state.forEach(function(def, guideId) {
  //       var gtype = def.get('_gtype'),
  //           scale;

  //       if (gtype === GTYPES.AXIS) {
  //         scale = def.get('scale');
  //       } else if (gtype === GTYPES.LEGEND) {
  //         scale = def.get(def.get('_type'));
  //       }

  //       if (scale === scaleId) {
  //         deleteKeyFromMap(newState, guideId);
  //       }
  //     });
  //   });
  // }

  return state;
}