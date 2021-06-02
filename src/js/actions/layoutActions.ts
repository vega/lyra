import {createStandardAction} from 'typesafe-actions';
import {LayoutRecord, PlaceholderRecord, Placeholder} from '../store/factory/Layout';
import {assignId} from '../util/counter';
import {State} from '../store';
import {Dispatch} from 'redux';
import {GroupRecord} from '../store/factory/marks/Group';
import {batchGroupBy} from '../reducers/historyOptions';
import {propSg} from '../util/prop-signal';

export function addLayout (payload: LayoutRecord) {
  return function(dispatch: Dispatch, getState: () => State) {
    const id = payload._id || assignId(dispatch, getState());
    dispatch(baseAddLayout(payload.merge({_id: id}), id));
  };
}
export const baseAddLayout = createStandardAction('ADD_LAYOUT')<LayoutRecord, number>();


export function addGrouptoLayout (payload: {group: GroupRecord, dir: string, index: number}, id: number) {
  return function(dispatch: Dispatch, getState: () => State) {
    batchGroupBy.start();
    let newDim = 0;
    let otherDim = null;
    let updateDim = null;
    if (payload.index != null && payload.dir !="init"){
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

    const rowSizes = getState().getIn(['vis', 'present', 'layouts', id, 'rowSizes']);
    const colSizes = getState().getIn(['vis', 'present', 'layouts', id, 'colSizes']);
    // console.log(rowSizes, colSizes);
    if (rowSizes && colSizes) {
      let numDims = (payload.dir == "top" || payload.dir == "bottom")?  colSizes.length:  rowSizes.length;
      for (let i=0; i< numDims; i++) {
        let top, left, width, height;
        if (i != payload.index) {
          if (payload.dir == "top" || payload.dir == "bottom") {
            // row = this.props.direction == "top" ? 0 : this.props.rowSizes.length;
            // col = i;
            const topSignalName = propSg(id, "layout", "row_" + String(newDim)+"_pos");
            top = {"signal": topSignalName};
            const leftSignalName = colSizes[i].signal.slice(0,-4) + "pos";
            left = {"signal": leftSignalName};
            width = colSizes[i];
            const heightSignalName = propSg(id, "layout", "row_" + String(newDim)+"_size");
            height = {"signal": heightSignalName};
          } else if (payload.dir == "left" || payload.dir == "right") {
            // row = i;
            // col = this.props.direction == "left" ? 0 : this.props.colSizes.length;
            const topSignalName = rowSizes[i].signal.slice(0,-4) + "pos";
            top = {"signal": topSignalName};
            const leftSignalName = propSg(id, "layout", "col_" + String(newDim)+"_pos");
            left = {"signal": leftSignalName};
            const widthSignalName = propSg(id, "layout", "col_" + String(newDim)+"_size");
            width = {"signal": widthSignalName};
            height = rowSizes[i];

          }
          const holder = Placeholder({top, left, width, height});
          dispatch(addPlaceHoldertoLayout(holder, id) as any);
        }
      }
    }
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