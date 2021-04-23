import {createStandardAction} from 'typesafe-actions';
import {LayoutRecord, PlaceholderRecord, Placeholder} from '../store/factory/Layout';
import {assignId} from '../util/counter';
import {State} from '../store';
import {Dispatch} from 'redux';
import {GroupRecord} from '../store/factory/marks/Group';
import {setSignal} from './signalActions';
import {batchGroupBy} from '../reducers/historyOptions';
import {defaultGroupHeight, defaultGroupWidth, defaultGroupSpacing} from '../store/factory/marks/Group';

export function addLayout (payload: LayoutRecord) {
  return function(dispatch: Dispatch, getState: () => State) {
    const id = payload._id || assignId(dispatch, getState());
    dispatch(baseAddLayout(payload.merge({_id: id}), id));
  };
}
export const baseAddLayout = createStandardAction('ADD_LAYOUT')<LayoutRecord, number>();


export function addGrouptoLayout (payload: {group: GroupRecord, dir: string, index: number}, id: number) {
  return function(dispatch: Dispatch, getState: () => State) {
    const groups = getState().getIn(['vis', 'present', 'layouts', id, 'groups']);
    const placeholders = getState().getIn(['vis', 'present', 'layouts', id, 'placeHolders']);

    batchGroupBy.start();
    if (payload.dir == "top") {
      groups.forEach(groupId => {
        const y_sig = getState().getIn(['vis', 'present', 'marks', String(groupId), 'encode', 'update', 'y', 'signal']);
        const y_sig_val = getState().getIn(['vis', 'present', 'signals', y_sig, 'value']);
        const value = y_sig_val + defaultGroupHeight + defaultGroupSpacing;
        dispatch(setSignal(value, y_sig) as any);
      });
      if (placeholders) {
        placeholders.forEach(placeholder => {
          const newPlaceholder = Placeholder({_id: placeholder._id, top: placeholder.top +180, left: placeholder.left, width: placeholder.width, height: placeholder.height});
          dispatch(setPlaceholderProperty(newPlaceholder, id));
        });
      }

    } else if (payload.dir == "left") {
      groups.forEach(groupId => {
        const x_sig = getState().getIn(['vis', 'present', 'marks', String(groupId), 'encode', 'update', 'x', 'signal']);
        const x_sig_val = getState().getIn(['vis', 'present', 'signals', x_sig, 'value']);
        const value = x_sig_val + defaultGroupWidth + defaultGroupSpacing;
        dispatch(setSignal(value, x_sig) as any);
      });
      if (placeholders) {
        placeholders.forEach(placeholder => {
          const newPlaceholder = Placeholder({_id: placeholder._id, top: placeholder.top, left: placeholder.left+230, width: placeholder.width, height: placeholder.height});
          dispatch(setPlaceholderProperty(newPlaceholder, id));
        });
      }
    };

    let newDim = 0;
    let otherDim = null;
    let updateDim = null;
    if (payload.dir !="init"){
      if (payload.dir == 'top' || payload.dir == 'bottom'){
        newDim = getState().getIn(['vis', 'present', 'layouts', String(id), 'rowSizes']).length;
        otherDim = getState().getIn(['vis', 'present', 'layouts', String(id), 'colSizes'])[payload.index].signal
        updateDim = payload.dir == 'top' ? getState().getIn(['vis', 'present', 'layouts', String(id), 'rowSizes'])[0].signal : getState().getIn(['vis', 'present', 'layouts', String(id), 'rowSizes'])[newDim-1].signal;
      } else {
        newDim = getState().getIn(['vis', 'present', 'layouts', String(id), 'colSizes']).length;
        otherDim = getState().getIn(['vis', 'present', 'layouts', String(id), 'rowSizes'])[payload.index].signal;
        updateDim = payload.dir == 'left' ? getState().getIn(['vis', 'present', 'layouts', String(id), 'colSizes'])[0].signal : getState().getIn(['vis', 'present', 'layouts', String(id), 'colSizes'])[newDim-1].signal;
      }

    }
    dispatch(baseAddGrouptoLayout({group: (payload.group) as GroupRecord, dir: (payload.dir) as string, newDim: newDim, otherDim:otherDim, updateDim: updateDim}, id));
    batchGroupBy.end();
  }
}
export const baseAddGrouptoLayout = createStandardAction('ADD_GROUP_TO_LAYOUT')<{group: GroupRecord, dir: string, newDim: number, otherDim:string, updateDim: string}, number>();
export function addPlaceHoldertoLayout (payload: PlaceholderRecord, layoutId) {
  return function(dispatch: Dispatch, getState: () => State) {
    const id = payload._id || assignId(dispatch, getState());
    dispatch(baseAddPlaceholdertoLayout(payload.merge({_id: id}), layoutId));
  };
}
export const baseAddPlaceholdertoLayout = createStandardAction('ADD_PLACEHOLDER_TO_LAYOUT')<PlaceholderRecord, number>();

export const removePlaceHolder = createStandardAction('REMOVE_PLACEHOLDER')<number, number>();

export const setPlaceholderProperty = createStandardAction('SET_PLACEHOLDER_PROPERTY')<PlaceholderRecord, number>();