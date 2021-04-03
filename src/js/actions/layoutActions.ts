import {createStandardAction} from 'typesafe-actions';
import {LayoutRecord, PlaceHolderRecord, placeHolder} from '../store/factory/Layout';
import {assignId} from '../util/counter';
import {State} from '../store';
import {Dispatch} from 'redux';
import {MarkRecord} from '../store/factory/Mark';
import {setSignal} from './signalActions';
import {batchGroupBy} from '../reducers/historyOptions';

export function addLayout (payload: LayoutRecord) {
  return function(dispatch: Dispatch, getState: () => State) {
    const id = payload._id || assignId(dispatch, getState());
    dispatch(baseAddLayout(payload.merge({_id: id}), id));
  };
}
export const baseAddLayout = createStandardAction('ADD_LAYOUT')<LayoutRecord, number>();


export function addGrouptoLayout (payload: {group: MarkRecord, dir: string}, id: number) {
  return function(dispatch: Dispatch, getState: () => State) {
    const groups = getState().getIn(['vis', 'present', 'layouts', id, 'groups']);
    const placeholders = getState().getIn(['vis', 'present', 'layouts', id, 'placeHolders']);
    batchGroupBy.start();
    if (payload.dir == "top") {
      groups.forEach(groupId => {
        const y_sig = getState().getIn(['vis', 'present', 'marks', String(groupId), 'encode', 'update', 'y', 'signal']);
        const y_sig_val = getState().getIn(['vis', 'present', 'signals', y_sig, 'value']);
        const value = y_sig_val + 180;
        dispatch(setSignal(value, y_sig) as any);
      });
      if (placeholders) {
        placeholders.forEach(placeholder => {
          const newPlaceholder = placeHolder({_id: placeholder._id, top: placeholder.top +180, left: placeholder.left, width: placeholder.width, height: placeholder.height});
          dispatch(setPlaceHolderProperty(newPlaceholder, id));
        });
      }

    } else if (payload.dir == "left") {
      groups.forEach(groupId => {
        const x_sig = getState().getIn(['vis', 'present', 'marks', String(groupId), 'encode', 'update', 'x', 'signal']);
        const x_sig_val = getState().getIn(['vis', 'present', 'signals', x_sig, 'value']);
        const value = x_sig_val + 230;
        dispatch(setSignal(value, x_sig) as any);
      });
      if (placeholders) {
        placeholders.forEach(placeholder => {
          const newPlaceholder = placeHolder({_id: placeholder._id, top: placeholder.top, left: placeholder.left+230, width: placeholder.width, height: placeholder.height});
          dispatch(setPlaceHolderProperty(newPlaceholder, id));
        });
      }
    };
    dispatch(baseAddGrouptoLayout(payload, id));
    batchGroupBy.end();
  }
}
export const baseAddGrouptoLayout = createStandardAction('ADD_GROUP_TO_LAYOUT')<{group: MarkRecord, dir: string}, number>();
export function addPlaceHoldertoLayout (payload: PlaceHolderRecord, layoutId) {
  return function(dispatch: Dispatch, getState: () => State) {
    const id = payload._id || assignId(dispatch, getState());
    dispatch(baseAddPlaceHoldertoLayout(payload.merge({_id: id}), layoutId));
  };
}
export const baseAddPlaceHoldertoLayout = createStandardAction('ADD_PLACEHOLDER_TO_LAYOUT')<PlaceHolderRecord, number>();

export const removePlaceHolder = createStandardAction('REMOVE_PLACEHOLDER')<number, number>();

export const setPlaceHolderProperty = createStandardAction('SET_PLACEHOLDER_PROPERTY')<PlaceHolderRecord, number>();