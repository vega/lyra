import {fromJS, Map} from 'immutable';
import {ActionType, getType} from 'typesafe-actions';
import * as guideActions from '../actions/guideActions';
import * as scaleActions from '../actions/scaleActions';
import {GuideRecord, GuideState, isAxis, isLegend} from '../store/factory/Guide';

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

export function guidesReducer(state: GuideState, action: ActionType<typeof guideActions> | ActionType<typeof scaleActions.deleteScale> | ActionType<typeof scaleActions.updateScaleProperty>): GuideState {
  const id = action.meta;

  if (typeof state === 'undefined') {
    return Map();
  }

  if (action.type === getType(guideActions.baseAddGuide)) {
    return state.set(String(id), makeGuide(action));
  }

  if (action.type === getType(guideActions.deleteGuide)) {
    return state.remove(String(id));
  }

  if (action.type === getType(guideActions.updateGuideProperty)) {
    return state.setIn([String(id), ...action.payload.property.split(".")], fromJS(action.payload.value));
  }

  if (action.type === getType(scaleActions.updateScaleProperty)) {
    const p = action.payload;
    let newState = state;
    if (p.property === '_domain') {
      // if we're updating a scale domain, edit the default guide titles to list all the fields in the domain
      state.valueSeq().forEach(guide => {
        let scaleId;
        if (isAxis(guide)) {
          scaleId = guide.scale;
        }
        if (isLegend(guide)) {
          scaleId = guide[guide._type];
        }
        if (String(scaleId) === String(id)) {
          const fieldsInScale = p.value.map(x => x.field);
          // guide uses scale that is being updated
          if (!guide.title) {
            newState = newState.setIn([String(guide._id), 'title'], fieldsInScale.join(', '));
          }
          else if (guide.title && typeof guide.title === 'string') {
            const fieldsInCurrentTitle = (guide.title as String).split(', ');
            // if the current title is a default title (it's a list of fields, comma separated)
            // and it differs from the list of fields by one edit (a field was added or deleted)
            if (fieldsInCurrentTitle.every(f => fieldsInScale.includes(f)) && (fieldsInCurrentTitle.length + 1) === fieldsInScale.length ||
              fieldsInScale.every(f => fieldsInCurrentTitle.includes(f)) && (fieldsInScale.length + 1) === fieldsInCurrentTitle.length)
            newState = newState.setIn([String(guide._id), 'title'], fieldsInScale.join(', '));
          }
        }
      });
    }
    return newState;
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
