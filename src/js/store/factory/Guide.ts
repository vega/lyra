import {Map, Record, RecordOf} from 'immutable';
import {Axis as VegaAxis, Legend as VegaLegend} from 'vega-typings';
import {ScaleRecord} from './Scale';

const ORIENT = {x: 'bottom', y: 'left'};

export namespace GuideType {
  export const Axis = 'axis';
  export const Legend = 'legend';
}

export type GuideType = 'axis' | 'legend';

export namespace LegendForType {
  export const fill = 'fill';
  export const opacity = 'opacity';
  export const shape = 'shape';
  export const size = 'size';
  export const stroke = 'stroke';
  export const strokeDash = 'strokeDash';
}

export type LegendForType = 'fill' | 'opacity' | 'shape' | 'size' | 'stroke' | 'strokeWidth' | 'strokeDash';

export type LyraAxis = {
  _gtype: GuideType,
  _id: number
} & VegaAxis;

export const Axis = Record<LyraAxis>({
  _gtype: GuideType.Axis,
  _id: null,
  orient: null,
  scale: null,
  tickCount: null, // replaces ticks
  tickSize: null,
  grid: false,
  title: null,
  zindex: 0, // replaces layer
  encode: {}
}, 'LyraAxis');

export type AxisRecord = RecordOf<LyraAxis>;

export type LyraLegend = {
  _gtype: GuideType,
  _id: number,
  _type: LegendForType
} & VegaLegend;

export const Legend = Record<LyraLegend>({
  _id: null,
  _type: null,
  _gtype: GuideType.Legend,
  fill: null,
  opacity: null,
  shape: null,
  size: null,
  stroke: null,
  strokeWidth: null,
  strokeDash: null,
  symbolFillColor: '#ffffff',
  symbolOpacity: 1,
  strokeColor: '#ffffff',
  encode: {}
}, 'LyraLegend');

export type LegendRecord = RecordOf<LyraLegend>;

export type LyraGuide = LyraAxis | LyraLegend;
export type GuideRecord = AxisRecord | LegendRecord;

/**
 * A factory to produce a Lyra guide (axis or legend).
 *
 * @param {GuideType} gtype - Axis or Legend (use enumerated `Guide.GuideType`).
 * @param {string} type - Axis/legend type (e.g., `x` axis, or `fill` legend).
 * @param {number|Object} scale - The ID or Lyra Scale Primitive that backs the guide.
 *
 * @property {number} _gtype - Axis or Legend (based on enumerate `Guide.GuideType`).
 * @property {string} _type - Type for legends (e.g., `fill`, `stroke`, etc.).
 * @see Vega's {@link https://github.com/vega/vega/wiki/Axes|Axes} or
 * {@link https://github.com/vega/vega/wiki/Legends|Legends} documentation for
 * more information on this class' "public" properties.
 *
 * @constructor
 */

export function Guide(gtype : GuideType, type: string, scaleId : number | ScaleRecord) : AxisRecord | LegendRecord {
  const scale: string = (scaleId as ScaleRecord)._id ? String((scaleId as ScaleRecord)._id) : String(scaleId);
  if (gtype === GuideType.Axis) {
    return Axis({
      orient: ORIENT[type],
      scale
    });
  } else if (gtype === GuideType.Legend) {
    return Legend({
      _type: type as LegendForType,
      [type]: scale,
      encode: {}
    });
  }
};

export type GuideState = Map<string, GuideRecord>;

export function isAxis(guide: GuideRecord): guide is AxisRecord {
  return guide && guide._gtype === GuideType.Axis;
}

export function isLegend(guide: GuideRecord): guide is LegendRecord {
  return guide && guide._gtype === GuideType.Legend;
}
