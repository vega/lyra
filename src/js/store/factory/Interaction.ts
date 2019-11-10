import {Map, Record, RecordOf} from 'immutable';
import {LyraSelectionPreviewDef, LyraMappingPreviewDef} from '../../components/interactions/InteractionPreviewController';
import {Signal} from 'vega';

export interface LyraInteraction {
  id: number;
  name: string;
  groupId: number;
  selectionDef: LyraSelectionPreviewDef;
  mappingDef: LyraMappingPreviewDef;
  widgetSignals: Signal[];
};

export const Interaction = Record<LyraInteraction>({
  id: null,
  name: null,
  groupId: null,
  selectionDef: null,
  mappingDef: null,
  widgetSignals: [],
}, 'LyraInteraction');

export type InteractionRecord = RecordOf<LyraInteraction>;
export type InteractionState = Map<string, InteractionRecord>;
