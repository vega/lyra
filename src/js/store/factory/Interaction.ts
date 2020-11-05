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


export function getInteractionSignals(interactionId: number, input: InteractionInput, scaleInfo: ScaleInfo, fieldsOfGroup: string[]): InteractionSignal[] {
  if (!input) return [];
  const {xScaleName, yScaleName, xFieldName, yFieldName} = scaleInfo;

  const signals: InteractionSignal[] = [];

  switch (input.mouse) {
    case 'drag':
      if (xScaleName) {
        signals.push({
          signal: `brush_x_start_${interactionId}`,
          label: 'brush_x (start)'
        });
        signals.push({
          signal: `brush_x_end_${interactionId}`,
          label: 'brush_x (end)'
        });
        if (xFieldName) {
          signals.push({
            signal: `brush_${xFieldName}_${xScaleName}_start_${interactionId}`,
            label: `brush_${xFieldName} (start)`
          });
          signals.push({
            signal: `brush_${xFieldName}_${xScaleName}_end_${interactionId}`,
            label: `brush_${xFieldName} (end)`
          });
        }
      }
      if (yScaleName) {
        signals.push({
          signal: `brush_y_start_${interactionId}`,
          label: 'brush_y (start)'
        });
        signals.push({
          signal: `brush_y_end_${interactionId}`,
          label: 'brush_y (end)'
        });
        if (yFieldName) {
          signals.push({
            signal: `brush_${yFieldName}_${yScaleName}_start_${interactionId}`,
            label: `brush_${yFieldName} (start)`
          });
          signals.push({
            signal: `brush_${yFieldName}_${yScaleName}_end_${interactionId}`,
            label: `brush_${yFieldName} (end)`
          });
        }
      }
      break;
      case 'click':
        fieldsOfGroup.forEach(field => {
          signals.push({
            signal: `point_${field}_${interactionId}`,
            label: `point_${field}`
          });
        })
        break;
      case 'mouseover':
        signals.push({
          signal: `mouse_x_${interactionId}`,
          label: 'mouse_x'
        });
        signals.push({
          signal: `mouse_y_${interactionId}`,
          label: 'mouse_y'
        });
        if (xFieldName) {
          signals.push({
            signal: `mouse_${xFieldName}_${interactionId}`,
            label: `mouse_${xFieldName}`
          });
        }
        if (yFieldName) {
          signals.push({
            signal: `mouse_${yFieldName}_${interactionId}`,
            label: `mouse_${yFieldName}`
          });
        }
        fieldsOfGroup.forEach(field => {
          signals.push({
            signal: `point_${field}_${interactionId}`,
            label: `point_${field}`
          });
        })
        break;
  }
  return signals;
}
