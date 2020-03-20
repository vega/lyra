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

export interface LyraDraggingState {
  dsId?: number;
  fieldDef?: ColumnRecord;
}

export const DraggingState = Record<LyraDraggingState>({
  dsId: null,
  fieldDef: null
}, 'LyraDraggingState');

export type DraggingStateRecord = RecordOf<LyraDraggingState>;

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
