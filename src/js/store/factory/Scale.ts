import {Map, Record, RecordOf} from 'immutable';
import {IdentityScale, Scale as ScaleType} from 'vega-typings/types';

export type RangeScale = Exclude<ScaleType, IdentityScale>;

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
  _domain: any[],
  _range: any[]
} & RangeScale;

const names = {};

// Scales churn (unused scales are deleted) and thus we want to reuse names
// as much as possible.
function rename(name): string {
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
    _origName: values.name,
    _domain: [],
    _range: [],

    ...values,
    name: rename(values.name)
  } as any, 'LyraScale')();
}

export type ScaleRecord = RecordOf<LyraScale>;
export type ScaleState = Map<string, ScaleRecord>;
