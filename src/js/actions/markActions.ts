import {AnyAction, Dispatch} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {createStandardAction} from 'typesafe-actions';
import {NumericValueRef, StringValueRef} from 'vega';
import {UnitSpec} from 'vega-lite/src/spec';
import {batchGroupBy} from '../reducers/historyOptions';
import {State} from '../store';
import {LyraMarkType, Mark, MarkRecord, HandleStreams} from '../store/factory/Mark';
import {GroupRecord} from '../store/factory/marks/Group';
import {addGrouptoLayout} from './layoutActions';
import {addSignalUpdate} from './signalActions';
import {assignId} from '../util/counter';
import {ThunkDispatch} from 'redux-thunk';
import {propSg} from '../util/prop-signal';

const capitalize = require('capitalize');
const getInVis = require('../util/immutable-utils').getInVis;

export type VegaLiteUnit = UnitSpec;

function nameMark(state: State, type: string): string {
  type = type || 'Mark';
  const numMarks = state.getIn(['vis', 'present', 'marks']).filter(mark => mark.type === type).size;
  return capitalize(type) + ' ' + (numMarks + 1);
}

export function addMark (record: MarkRecord) {
  return function(dispatch: Dispatch, getState: () => State) {
    const id = record._id || assignId(dispatch, getState());
    record = (record as any).set('_id', id) as MarkRecord;

    if (!record.name) {
      const name = nameMark(getState(), record.type)
      record = (record as any).set('name', name) as MarkRecord;
    }

    dispatch(baseAddMark({
      name: record.name,
      streams: Mark.getHandleStreams(record),
      props: record
    }, id));
  };
}

export function addGroup(record: GroupRecord, layoutId: number, dir: string, index: number) {
  return function(dispatch: ThunkDispatch<State, any, any>, getState: () => State) {
    const id = record._id || assignId(dispatch, getState());
    record = record.set('_id', id) as GroupRecord;

    // console.log("mark actions", record.toJS());
    let topSig, leftSig, widthSig, heightSig;
    let update = false;
    if (record.encode.update.x.name) {
      update = true;
      console.log("x", record.encode.update.x.name)
      topSig = record.encode.update.y.name;
      leftSig = record.encode.update.x.name;
      widthSig = record.encode.update.width.name;
      heightSig = record.encode.update.height.name;
    }
    batchGroupBy.start();
    dispatch(addMark(record));
    dispatch(addGrouptoLayout({group: record, dir, index}, layoutId));
    if (update) {
      dispatch(addSignalUpdate(leftSig, propSg(id, "group", "x")));
      dispatch(addSignalUpdate(topSig, propSg(id, "group", "y")));
      dispatch(addSignalUpdate(widthSig, propSg(id, "group", "width")));
      dispatch(addSignalUpdate(heightSig, propSg(id, "group", "height")));
    }
    batchGroupBy.end();
  };
}
export const baseAddMark = createStandardAction('ADD_MARK')<{name: string, streams: HandleStreams, props: MarkRecord}, number>();


export const updateMarkProperty = createStandardAction('UPDATE_MARK_PROPERTY')<{property: string, value: any}, number>();

export const setParent = createStandardAction('SET_PARENT_MARK')<number, number>(); // parentId, childId

export const setMarkVisual = createStandardAction('SET_MARK_VISUAL')<{property: string, def: NumericValueRef | StringValueRef}, number>();

export const disableMarkVisual = createStandardAction('DISABLE_MARK_VISUAL')<string, number>();
export const resetMarkVisual = createStandardAction('RESET_MARK_VISUAL')<string, number>();
export const bindScale = createStandardAction('BIND_SCALE')<{scaleId: number, property: string}, number>();
export const bindField = createStandardAction('BIND_FIELD')<{field: string, property: string}, number>();
export const setMarkExtent = createStandardAction('SET_MARK_EXTENT')<{oldExtent: string, newExtent: string}, number>();
export const setVlUnit = createStandardAction('SET_VL_UNIT')<VegaLiteUnit, number>();

export function deleteMark(id: number): ThunkAction<void, State, null, AnyAction> {
  return function(dispatch, getState) {
    const mark = getInVis(getState(), 'marks.' + id);
    const children = mark.get('marks');

    batchGroupBy.start();

    if (children && children.size) {
      children.forEach(function(childId) {
        dispatch(deleteMark(childId));
      });
    }

    dispatch(baseDeleteMark(mark.type, mark._id));

    batchGroupBy.end()
  };
}

export const baseDeleteMark = createStandardAction('DELETE_MARK')<LyraMarkType, number>();
