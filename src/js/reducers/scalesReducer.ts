import {Map} from 'immutable';
import {ActionType, getType} from 'typesafe-actions';
import * as scaleActions from '../actions/scaleActions';
import {ScaleState, ScaleRecord} from '../store/factory/Scale';

// Scales churn (unused scales are deleted) and thus we want to reuse names
// as much as possible.
function renameScale(state: ScaleState, name: string): string {
  const names = state.valueSeq().map((scaleRecord: ScaleRecord) => {
    return scaleRecord.get('name');
  });
  let count = 1;
  let str = name || 'scale';
  while (names.contains(str)) {
    str = name + '' + ++count;
  }
  return str;
}

export function scalesReducer(state: ScaleState, action: ActionType<typeof scaleActions>): ScaleState {
  const id = action.meta;

  if (typeof state === 'undefined') {
    return Map();
  }

  if (action.type === getType(scaleActions.baseAddScale)) {
    let record = (action.payload as any).set('name', renameScale(state, action.payload.name)) as ScaleRecord;
    return state.set(String(id), record);
  }

  if (action.type === getType(scaleActions.updateScaleProperty)) {
    const p = action.payload;
    try {
      return state.setIn([String(id), ...p.property.split(".")], p.value);
    }
    catch (e) {
      const key = p.property.split(".").slice(-1).toString();
      const obj = {};
      obj[key] = p.value;
      return state.setIn([String(id), ...p.property.split(".").slice(0,-1)], obj);
    }
  }

  if (action.type === getType(scaleActions.amendDataRef)) {
    const p = action.payload;
    const refs = state.getIn([String(id), p.property]);
    return state.setIn([String(id), p.property], refs.push(p.ref));
  }

  if (action.type === getType(scaleActions.deleteScale)) {
    return state.remove(String(id));
  }

  return state;
}
