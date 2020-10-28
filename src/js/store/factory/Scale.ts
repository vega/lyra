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
  _manual: boolean,
  _manualArray: any[]
} & RangeScale;

export function Scale(values?: Partial<LyraScale>): ScaleRecord {
  return Record<LyraScale>({
    _id: null,
    _origName: null,
    _domain: [],
    _range: [],
    name: null,
    align: 0.5,
    padding: 0,
    paddingOuter: 0,
    paddingInner: 0,
    domainMin: null,
    domainMax: null,
    reverse: false,
    round: false,
    clamp: false,
    _manual: false,
    _manualArray: [],
    ...values,
  } as any, 'LyraScale')();
}

export type ScaleRecord = RecordOf<LyraScale>;
export type ScaleState = Map<string, ScaleRecord>;


export namespace ScaleSimpleType {
  export const CONTINUOUS = 'CONTINUOUS';
  export const DISCRETE = 'DISCRETE';
}
export type ScaleSimpleType = 'CONTINUOUS' | 'DISCRETE';

export function scaleTypeSimple(scaleType): ScaleSimpleType {
  switch (scaleType) {
    case 'linear':
    case 'log':
    case 'pow':
    case 'sqrt':
    case 'symlog':
    case 'time':
    case 'utc':
    case 'sequential':
      return ScaleSimpleType.CONTINUOUS;
    case 'ordinal':
    case 'band':
    case 'point':
    case 'quantile':
    case 'quantize':
    case 'threshold':
    case 'bin-ordinal':
      return ScaleSimpleType.DISCRETE;
  }
}