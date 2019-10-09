import {Record, RecordOf} from 'immutable';
import {InspectorSelectedType} from '../../actions/inspectorActions';

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

interface LyraInspector {
  pipelines: {
    selectedId: number;
  };
  encodings: EncodingStateRecord
}

export const Inspector = Record<LyraInspector>({
  pipelines: {
    selectedId: null
  },
  encodings: EncodingState()
}, 'LyraInspector');

export type InspectorRecord = RecordOf<LyraInspector>;
