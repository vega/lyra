import {Map, Record, RecordOf} from 'immutable';
import {LyraSelectionPreviewDef, LyraMappingPreviewDef} from '../../components/interactions/InteractionPreviewController';

export interface LyraInteraction {
  id: number;
  name: string;
  groupId: number;
  selectionDef: LyraSelectionPreviewDef;
  mappingDef: LyraMappingPreviewDef;
};

export const Interaction = Record<LyraInteraction>({
  id: null,
  name: null,
  groupId: null,
  selectionDef: null,
  mappingDef: null,
}, 'LyraInteraction');

export type InteractionRecord = RecordOf<LyraInteraction>;
export type InteractionState = Map<string, InteractionRecord>;
