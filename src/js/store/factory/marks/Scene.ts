import {Record, RecordOf} from 'immutable';
import {Omit} from 'react-redux';
import {GroupMark} from 'vega-typings/types';
import {Group} from './Group';

const dl = require('datalib');

export interface LyraSceneMark extends Omit<GroupMark, 'type'> {
  _id: number;
  _parent: number;
  type: 'scene';
}

export function Scene(values?: Partial<LyraSceneMark>): SceneRecord {
  const base = Group();

  return Record<LyraSceneMark>({
    type: 'scene',
    _id: null,
    _parent: null,
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
        width: 500,
        height: 500,
        padding: 'auto',
        background: 'white',
        x2: {_disabled: true},
        y2: {_disabled: true}
      })
    },
  })(values);
}
export type SceneRecord = RecordOf<LyraSceneMark>;
