import {Map, Record, RecordOf} from 'immutable';
import InteractionPreview from '../../components/interactions/InteractionPreview';
import {Signal} from 'vega';
import {ScaleInfo} from '../../components/interactions/InteractionPreviewController';
import {ScaleSimpleType} from '../../ctrl/demonstrations';

export interface PropertyValues {
  size: number,
  opacity: number,
  color: string,
}
export interface LyraInteraction {
  id: number;
  name: string;
  groupId: number;
  groupName: string;
  selection: LyraSelection;
  application: LyraApplication;
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

interface LyraInteractionPreview {
  id: string;
  label: string;
  ref?: React.RefObject<InteractionPreview>;
}

export type LyraPointSelection = {
  // type: 'point';
  field: string;

} & LyraInteractionPreview;

export type LyraIntervalSelection = {
  // type: 'interval';
  field: 'x' | 'y' | 'xy';
} & LyraInteractionPreview;

export type LyraSelection = LyraPointSelection | LyraIntervalSelection;

export type LyraMarkApplication = {
  // type: 'mark';
  targetMarkName: string; // which mark does this application affect?
  isDemonstratingInterval: boolean; // true for interval, false for point
} & LyraInteractionPreview;

export type LyraScaleApplication = {
  // type: 'scale';
  scaleInfo: ScaleInfo;
} & LyraInteractionPreview;

export type LyraTransformApplication = {
  // type: 'transform';
  targetGroupName: string; // which group does this application affect? (e.g. for filters, different from parent group)
  newDatasetName: string;
  isDemonstratingInterval: boolean; // true for interval, false for point
} & LyraInteractionPreview;

export type LyraApplication = LyraMarkApplication | LyraScaleApplication | LyraTransformApplication;

export const Interaction = Record<LyraInteraction>({
  id: null,
  name: null,
  groupId: null,
  groupName: null,
  selection: null,
  application: null,
  markPropertyValues: {size: 10, opacity: 0.2, color: '#666666'}
}, 'LyraInteraction');

export type InteractionRecord = RecordOf<LyraInteraction>;
export type InteractionState = Map<string, InteractionRecord>;
