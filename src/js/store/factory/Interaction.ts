import {Map, Record, RecordOf} from 'immutable';
import InteractionPreview from '../../components/interactions/InteractionPreview';
import {Signal} from 'vega';
import {ScaleSimpleType} from '../../ctrl/demonstrations';
import React from 'react';
import {LyraMark} from './Mark';
import {LyraScale} from './Scale';

export interface PropertyValues {
  size: number,
  opacity: number,
  color: string,
}
export interface LyraInteraction {
  id: number;
  name: string;
  groupId: number;
  selection: SelectionRecord;
  application: ApplicationRecord;
  markPropertyValues: PropertyValues;
};

export interface ScaleInfo {
  xScaleName: string;
  yScaleName: string;
  xFieldName: string;
  yFieldName: string;
  xScaleType: ScaleSimpleType;
  yScaleType: ScaleSimpleType;

}

type LyraInteractionPreviewType = 'point' | 'interval' | 'mark' | 'scale' | 'transform';

interface LyraInteractionPreview {
  type: LyraInteractionPreviewType;
  id: string;
  label: string;
}

export type LyraPointSelection = {
  ptype: 'single' | 'multi';
  field: string;

} & LyraInteractionPreview;

export const PointSelection = Record<LyraPointSelection>({
  type: 'point',
  ptype: null,
  id: null,
  label: null,
  field: null
}, 'LyraPointSelection');

export type PointSelectionRecord = RecordOf<LyraPointSelection>;

export type LyraIntervalSelection = {
  field: 'x' | 'y' | 'xy';
} & LyraInteractionPreview;

export const IntervalSelection = Record<LyraIntervalSelection>({
  type: 'interval',
  id: null,
  label: null,
  field: null
}, 'LyraIntervalSelection');

export type IntervalSelectionRecord = RecordOf<LyraIntervalSelection>;

export type SelectionRecord = PointSelectionRecord | IntervalSelectionRecord;

export type LyraMarkApplication = {
  targetMarkName: string; // which mark does this application affect?
  isDemonstratingInterval: boolean; // true for interval, false for point
  // selectedValue: any; // value of property when mark is selected /// TODO(jzong): currently using the existing mark value
  defaultValue: any; // value of property otherwise
} & LyraInteractionPreview;

export const MarkApplication = Record<LyraMarkApplication>({
  type: 'mark',
  id: null,
  label: null,
  targetMarkName: null,
  isDemonstratingInterval: null,
  // selectedValue: null,
  defaultValue: null
}, 'LyraMarkApplication');

export type MarkApplicationRecord = RecordOf<LyraMarkApplication>;

export type LyraScaleApplication = {
  scaleInfo: ScaleInfo;
} & LyraInteractionPreview;

export const ScaleApplication = Record<LyraScaleApplication>({
  type: 'scale',
  id: null,
  label: null,
  scaleInfo: null
}, 'LyraScaleApplication');

export type ScaleApplicationRecord = RecordOf<LyraScaleApplication>;

export type LyraTransformApplication = {
  targetGroupName: string; // which group does this application affect? (e.g. for filters, different from parent group)
  datasetName: string;
  targetMarkName: string,
  isDemonstratingInterval: boolean; // true for interval, false for point
} & LyraInteractionPreview;

export const TransformApplication = Record<LyraTransformApplication>({
  type: 'transform',
  id: null,
  label: null,
  targetGroupName: null,
  datasetName: null,
  targetMarkName: null,
  isDemonstratingInterval: null
}, 'LyraTransformApplication');

export type TransformApplicationRecord = RecordOf<LyraTransformApplication>;

export type ApplicationRecord = MarkApplicationRecord | ScaleApplicationRecord | TransformApplicationRecord;

export const Interaction = Record<LyraInteraction>({
  id: null,
  name: null,
  groupId: null,
  selection: null,
  application: null,
  markPropertyValues: {size: 10, opacity: 0.2, color: '#666666'}
}, 'LyraInteraction');

export type InteractionRecord = RecordOf<LyraInteraction>;
export type InteractionState = Map<string, InteractionRecord>;
