import {Record, RecordOf} from 'immutable';
import {GroupMark} from 'vega-typings';
import {Rect} from './Rect';

const dl = require('datalib');
const getInVis = require('../../../util/immutable-utils').getInVis;

export type LyraGroupMark = {
  _id: number,
  _manualLayout: boolean
} & GroupMark;

export function Group(values?: Partial<LyraGroupMark>): GroupRecord {
  const base = Rect();
  const state = require('../../').getState();
  const scene = getInVis(state, 'marks.' + getInVis(state, 'scene.id'));

  return Record<LyraGroupMark>({
    _id: null,
    _manualLayout: false,
    type: 'group',
    scales: [],
    axes: [],
    legends: [],
    marks: [],
    encode: {
      // To allow marks across layered groups to be selected interactively on
      // the campus, groups do not have a fill color by default. Users may, of
      // course set a fill color. If a group is explicitly selected from the
      // sidebar, a transparent fill is rendered in order for direct
      // manipulation events of the group itself to be captured.
      update: dl.extend({}, base.encode.update, {
        fill: undefined,
        stroke: undefined,
        x: {value: 0},
        y: {value: 0},
        width: {value: scene && scene.get('width')},
        height: {value: scene && scene.get('height')},
        x2: {_disabled: true},
        y2: {_disabled: true}
      })
    }
  })(values);
}

export type GroupRecord = RecordOf<LyraGroupMark>;
