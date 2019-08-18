import {Record, RecordOf} from 'immutable';
import {LyraGroupMark} from './Group';

export const Scene = Record<LyraGroupMark>({
  type: 'group',
  _id: null,
  _parent: null,
  _manualLayout: false,
  scales: [],
  axes: [],
  legends: [],
  marks: [],
  name: null,
  encode: {
    update: {
      fill: undefined,
      stroke: undefined,
      x: {value: 0},
      y: {value: 0},
      // TODO(jzong): _disabled is not part of vega-typings encode.d.ts
      // but somehow it works on group and rect so honestly idk
      // x2: {_disabled: true},
      // y2: {_disabled: true},
      // xc: {value: 70, _disabled: true},
      // yc: {value: 70, _disabled: true},
      width: {value: 640},
      height: {value: 360},
      padding: {value: 'auto'},
      background: {value: 'auto'},
    }
  },
});
export type SceneRecord = RecordOf<LyraGroupMark>;
