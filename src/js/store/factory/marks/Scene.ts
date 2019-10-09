import {Record, RecordOf} from 'immutable';
import {Spec} from 'vega-typings';

export type LyraScene = {
  _id: number;
  name: string;
} & Spec;

export const Scene = Record<LyraScene>({
  _id: null,
  name: 'Scene',
  background: 'white',
  autosize: 'pad',
  padding: 5,
  encode: {
    update: {}
  },
  scales: [],
  axes: [],
  legends: [],
  marks: [],
}, 'LyraScene');
export type SceneRecord = RecordOf<LyraScene>;
