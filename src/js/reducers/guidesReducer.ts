import {fromJS, Map} from 'immutable';
import {ActionType, getType} from 'typesafe-actions';
import * as guideActions from '../actions/guideActions';
import * as scaleActions from '../actions/scaleActions';
import {GuideRecord, GuideState, GuideType, isAxis, isLegend} from '../store/factory/Guide';

const str = require('../util/immutable-utils').str;
const convertValuesToSignals = require('../util/prop-signal').convertValuesToSignals;

function makeGuide(action : ActionType<typeof guideActions.baseAddGuide>): GuideRecord {
  const def: GuideRecord = action.payload;
  const props = def.encode;

  return (def as any).merge({
    encode: Object.keys(props).reduce(function(converted, name) {
      converted[name] = convertValuesToSignals(props[name], 'guide', def._id, name);
      return converted;
    }, {})
  });
}

export function guidesReducer(state: GuideState, action: ActionType<typeof guideActions> | ActionType<typeof scaleActions.deleteScale>): GuideState {
  const id = action.meta;

  if (typeof state === 'undefined') {
    return Map();
  }

  if (action.type === getType(guideActions.baseAddGuide)) {
    return state.set(str(id), makeGuide(action));
  }

  if (action.type === getType(guideActions.deleteGuide)) {
    return state.remove(str(id));
  }

  if (action.type === getType(guideActions.updateGuideProperty)) {
    return state.setIn([str(id), ...action.payload.property.split(".")], fromJS(action.payload.value));
  }

  if (action.type === getType(scaleActions.deleteScale)) {
    const scaleId = action.meta;
    return state.withMutations(function(newState) {
      state.forEach(function(guide, guideId) {
        const scale = isAxis(guide) ? guide.scale :
          isLegend(guide) ? guide[guide._type] : null;

          if (+scale === scaleId) {
            newState.delete(String(guideId));
          }
      });
    });
  }

  return state;
}
