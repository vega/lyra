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
  _range: any[],
  nice: any
} & RangeScale;

export function Scale(values?: Partial<LyraScale>): ScaleRecord {
  return Record<LyraScale>({
    _id: null,
    _origName: null,
    _domain: [],
    _range: [],
    name: null,
    exponent: null,
    align: null,
    padding: null,
    paddingOuter: null,
    domainMin: null,
    domainMax: null,
    ...values,
  } as any, 'LyraScale')();
}

export type ScaleRecord = RecordOf<LyraScale>;
export type ScaleState = Map<string, ScaleRecord>;
