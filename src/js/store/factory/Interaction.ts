import {Map, Record, RecordOf} from 'immutable';
import {ScaleSimpleType} from '../../ctrl/demonstrations';
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
  propertyName: string; // which property (e.g. fill, opacity, size)
  // selectedValue: any; // value of property when mark is selected /// TODO(jzong): currently using the existing mark value
  defaultValue: any; // value of property otherwise
} & LyraInteractionPreview;

export const MarkApplication = Record<LyraMarkApplication>({
  type: 'mark',
  id: null,
  label: null,
  targetMarkName: null,
  propertyName: null,
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
} & LyraInteractionPreview;

export const TransformApplication = Record<LyraTransformApplication>({
  type: 'transform',
  id: null,
  label: null,
  targetGroupName: null,
  datasetName: null,
  targetMarkName: null,
}, 'LyraTransformApplication');

export type TransformApplicationRecord = RecordOf<LyraTransformApplication>;

export type ApplicationRecord = MarkApplicationRecord | ScaleApplicationRecord | TransformApplicationRecord;

export interface InteractionInput {
  mouse: 'click' | 'drag' | 'mouseover';
  keycode?: number; // keycode
  _key?: string; // human readable key name
}

export interface LyraInteraction {
  id: number;
  name: string;
  groupId: number;
  input: InteractionInput;
  selection: SelectionRecord;
  applications: ApplicationRecord[];
};


export const Interaction = Record<LyraInteraction>({
  id: null,
  name: null,
  groupId: null,
  input: null,
  selection: null,
  applications: []
}, 'LyraInteraction');

export type InteractionRecord = RecordOf<LyraInteraction>;
export type InteractionState = Map<string, InteractionRecord>;
