import {createStandardAction} from 'typesafe-actions';
import {Encode} from 'vega-typings';
import { LyraMark, Mark, MarkRecord } from '../store/factory/Mark';

const counter  = require('../util/counter');
const getInVis = require('../util/immutable-utils').getInVis;
const historyActions = require('./historyActions');
const startBatch = historyActions.startBatch;
const endBatch = historyActions.endBatch;

// TODO: use the vega-lite unit type, probably defined here:
// https://github.com/vega/vega-lite/blob/d61deb9e4a2312114ce74945af65fc165309899a/src/spec/unit.ts
// may require modification of vega-lite typings
// import { GenericUnitSpec } from 'vega-lite/src/spec/unit';
type VegaLiteUnit = object;

export const addMark = createStandardAction('ADD_MARK').map((record: MarkRecord) => {
  const id: number = record._id || counter.global();
  record = record.merge({_id: id});

  return {
    payload: {
      name: record.name,
      streams: Mark.getHandleStreams(record),
      props: record
    }, meta: id
  }
});

export const updateMarkProperty = createStandardAction('UPDATE_MARK_PROPERTY')<{property: string, value: any}, number>();

export const setParent = createStandardAction('SET_PARENT_MARK')<number, number>(); // parentId, childId

export const setMarkVisual = createStandardAction('SET_MARK_VISUAL')<{property: string, def: Encode<LyraMark>}, number>();

export const disableMarkVisual = createStandardAction('DISABLE_MARK_VISUAL')<string, number>();
export const resetMarkVisual = createStandardAction('RESET_MARK_VISUAL')<string, number>();
export const bindScale = createStandardAction('BIND_SCALE')<{scaleId: number, property: string}, number>();
export const bindField = createStandardAction('BIND_FIELD')<{field: string, property: string}, number>();
export const setMarkExtent = createStandardAction('SET_MARK_EXTENT')<{oldExtent: string, newExtent: string}, number>();
export const setVlUnit = createStandardAction('SET_VL_UNIT')<VegaLiteUnit, number>();

export function deleteMark(id: number) {
  return function(dispatch, getState) {
    const mark = getInVis(getState(), 'marks.' + id);
    const children = mark.get('marks');

    dispatch(startBatch());

    if (children && children.size) {
      children.forEach(function(childId) {
        dispatch(deleteMark(childId));
      });
    }

    dispatch(baseDeleteMark(null, mark._id));

    dispatch(endBatch());
  };
}

export const baseDeleteMark = createStandardAction('DELETE_MARK')<null, number>();
