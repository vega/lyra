import {Record, RecordOf} from 'immutable';
import {InspectorSelectedType} from '../../actions/inspectorActions';
import {ColumnRecord} from './Dataset';

export interface ExpandedLayers {
  [key: number]: boolean
}

export interface LyraEncodingState {
  selectedId:   number,
  selectedType: InspectorSelectedType,
  expandedLayers: ExpandedLayers
}

const EncodingState = Record<LyraEncodingState>({
  selectedId:   null,
  selectedType: null,
  expandedLayers: {}
}, 'LyraEncodingState');

export type EncodingStateRecord = RecordOf<LyraEncodingState>;

export interface LyraFieldDraggingState {
  dsId?: number;
  fieldDef?: ColumnRecord;
}

export interface LyraSignalDraggingState {
  groupId?: number;
  signal?: string;
}

export const FieldDraggingState = Record<LyraFieldDraggingState>({
  dsId: null,
  fieldDef: null
}, 'LyraFieldDraggingState');


export const SignalDraggingState = Record<LyraSignalDraggingState>({
  groupId: null,
  signal: null
}, 'LyraSignalDraggingState');

export type FieldDraggingStateRecord = RecordOf<LyraFieldDraggingState>;
export type SignalDraggingStateRecord = RecordOf<LyraSignalDraggingState>;
export type DraggingStateRecord = FieldDraggingStateRecord | SignalDraggingStateRecord;

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
