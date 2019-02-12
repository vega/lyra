import {Map, Record, RecordOf} from 'immutable';
import {Scale as ScaleType} from 'vega-typings/types';

/**
 * Scales are functions that transform a domain of data values (numbers, dates, strings, etc.) to a range of visual values (pixels, colors, sizes).
 */
export type LyraScale = {
  /**
   * Unique id for scale.
   */
  _id: number;
  /**
   * Original scale name
   */
  _origName: string;
  _domain: [],
  _range: [],

} & ScaleType;

const names = {};

// Scales churn (unused scales are deleted) and thus we want to reuse names
// as much as possible.
function rename(name) {
  let count = 1;
  let str = name;
  while (names[str]) {
    str = name + '' + ++count;
  }
  return (names[str] = 1, str);
}

export function Scale(values?: Partial<LyraScale>): ScaleRecord {
  return Record<LyraScale>({
    _id: null,
    _origName: null,
    _domain: [],
    _range: [],

    name: rename(values.name)
  })(values);
}

export type ScaleRecord = RecordOf<LyraScale>;
export type ScaleState = Map<string, ScaleRecord>;
