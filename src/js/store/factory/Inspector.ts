import {Record, RecordOf} from 'immutable';
import {InspectorSelectedType} from '../../actions/inspectorActions';
import {ColumnRecord} from './Dataset';
import {LyraMarkType} from './Mark';

export interface ExpandedLayers {
  [key: number]: boolean
}

export interface LyraEncodingState {
  selectedId:   number,
  selectedType: InspectorSelectedType,
  expandedLayers: ExpandedLayers
}

export const EncodingState = Record<LyraEncodingState>({
  selectedId:   null,
  selectedType: null,
  expandedLayers: {}
}, 'LyraEncodingState');

export type EncodingStateRecord = RecordOf<LyraEncodingState>;

export interface LyraFieldDraggingState {
  dsId: number;
  fieldDef: ColumnRecord;
}

export interface LyraSignalDraggingState {
  interactionId: number;
  signal: string;
}

export interface LyraScaleDraggingState {
  scaleId: number;
  fieldName: string;
}
export interface LyraMarkDraggingState {
  mark:  LyraMarkType;
}

export const FieldDraggingState = Record<LyraFieldDraggingState>({
  dsId: null,
  fieldDef: null
}, 'LyraFieldDraggingState');


export const SignalDraggingState = Record<LyraSignalDraggingState>({
  interactionId: null,
  signal: null
}, 'LyraSignalDraggingState');

export const ScaleDraggingState = Record<LyraScaleDraggingState>({
  scaleId: null,
  fieldName: null,
}, 'LyraScaleDraggingState');

export const MarkDraggingState = Record<LyraMarkDraggingState>({
  mark: null,
}, 'LyraMarkDraggingState');

export type FieldDraggingStateRecord = RecordOf<LyraFieldDraggingState>;
export type SignalDraggingStateRecord = RecordOf<LyraSignalDraggingState>;
export type ScaleDraggingStateRecord = RecordOf<LyraScaleDraggingState>;
export type MarkDraggingStateRecord = RecordOf<LyraMarkDraggingState>;
export type DraggingStateRecord = FieldDraggingStateRecord | SignalDraggingStateRecord | ScaleDraggingStateRecord | MarkDraggingStateRecord;

interface LyraInspector {
  pipelines: {
    selectedId: number;
  };
  encodings: EncodingStateRecord;
  dragging: DraggingStateRecord;
}

export const Inspector = Record<LyraInspector>({
  pipelines: {
    selectedId: null
  },
  encodings: EncodingState(),
  dragging: null
}, 'LyraInspector');

export type InspectorRecord = RecordOf<LyraInspector>;
