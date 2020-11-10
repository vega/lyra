import {Map, Record, RecordOf} from 'immutable';
export interface ScaleInfo {
  xScaleName: string;
  yScaleName: string;
  xFieldName: string;
  yFieldName: string;

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
  encoding: 'x' | 'y';
} & LyraInteractionPreview;

export const PointSelection = Record<LyraPointSelection>({
  type: 'point',
  ptype: null,
  id: null,
  label: null,
  field: null,
  encoding: null
}, 'LyraPointSelection');

export type PointSelectionRecord = RecordOf<LyraPointSelection>;

export type LyraIntervalSelection = {
  encoding: 'x' | 'y';
} & LyraInteractionPreview;

export const IntervalSelection = Record<LyraIntervalSelection>({
  type: 'interval',
  id: null,
  label: null,
  encoding: null
}, 'LyraIntervalSelection');

export type IntervalSelectionRecord = RecordOf<LyraIntervalSelection>;

export type SelectionRecord = PointSelectionRecord | IntervalSelectionRecord;

export type LyraMarkApplication = {
  targetGroupName: string; // which group does this application affect?
  targetMarkName: string; // which mark does this application affect?
  propertyName: string; // which property (e.g. fill, opacity, size)
  unselectedValue: any; // value of property otherwise
} & LyraInteractionPreview;

export const MarkApplication = Record<LyraMarkApplication>({
  type: 'mark',
  id: null,
  label: null,
  targetGroupName: null,
  targetMarkName: null,
  propertyName: null,
  unselectedValue: null
}, 'LyraMarkApplication');

export type MarkApplicationRecord = RecordOf<LyraMarkApplication>;

export type LyraScaleApplication = {
  targetGroupName: string;
  scaleInfo: ScaleInfo;
} & LyraInteractionPreview;

export const ScaleApplication = Record<LyraScaleApplication>({
  type: 'scale',
  id: null,
  label: null,
  targetGroupName: null,
  scaleInfo: null
}, 'LyraScaleApplication');

export type ScaleApplicationRecord = RecordOf<LyraScaleApplication>;

export type LyraTransformApplication = {
  targetGroupName: string; // which group does this application affect? (e.g. for filters, different from parent group)
  targetMarkName: string;
  datasetName: string;
} & LyraInteractionPreview;

export const TransformApplication = Record<LyraTransformApplication>({
  type: 'transform',
  id: null,
  label: null,
  targetGroupName: null,
  targetMarkName: null,
  datasetName: null,
}, 'LyraTransformApplication');

export type TransformApplicationRecord = RecordOf<LyraTransformApplication>;

export type ApplicationRecord = MarkApplicationRecord | ScaleApplicationRecord | TransformApplicationRecord;

export interface InteractionInput {
  mouse: 'click' | 'drag' | 'mouseover';
  nearest?: boolean; // nearest parameter for 'mouseover'
  keycode?: number; // keycode
  _key?: string; // human readable key name
}

export interface InteractionSignal {
  signal: string;
  label: string; // human-readable label
  push?: boolean; // does the signal need to pushed to top level? set to true when bound to a mark property or used in a transform expression
}

export interface LyraInteraction {
  id: number;
  name: string;
  groupId: number;
  input: InteractionInput;
  selection: SelectionRecord;
  applications: ApplicationRecord[];
  signals: InteractionSignal[];
};


export const Interaction = Record<LyraInteraction>({
  id: null,
  name: null,
  groupId: null,
  input: null,
  selection: null,
  applications: [],
  signals: []
}, 'LyraInteraction');

export type InteractionRecord = RecordOf<LyraInteraction>;
export type InteractionState = Map<string, InteractionRecord>;
