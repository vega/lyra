import {Record, RecordOf} from 'immutable';
import {InspectorSelectedType} from '../../actions/inspectorActions';

export interface ExpandedLayers {
  [key: number]: boolean
}
interface LyraInspector {
  pipelines: {
    selectedId: number;
  };
  encodings: {
    selectedId: number;
    selectedType: InspectorSelectedType;
    expandedLayers: ExpandedLayers
  }
}

export const Inspector = Record<LyraInspector>({
  pipelines: {
    selectedId: null
  },
  encodings: {
    selectedId:   null,
    selectedType: null,
    expandedLayers: {}
  }
});

export type InspectorRecord = RecordOf<LyraInspector>;
