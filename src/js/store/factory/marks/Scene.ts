import {Record, RecordOf} from 'immutable';
import {Spec} from 'vega-typings';

export type LyraScene = {
  _id: number;
  name: string;
} & Spec;

export const Scene = Record<LyraScene>({
  _id: null,
  name: 'Scene',
  scales: [],
  axes: [],
  legends: [],
  marks: [],
  autosize: 'pad',
  background: 'white',
  encode: {
    update: {}
  }
});
export type SceneRecord = RecordOf<LyraScene>;
