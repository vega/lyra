import {Map, Record, RecordOf} from 'immutable';
import {intervalPreviewDefs, pointPreviewDefs, mappingPreviewDefs} from '../../ctrl/demonstrations';

export interface LyraInteraction {
  id: number;
  groupId: number;
  interactionType: LyraInteractionType;
  mappingType: LyraMappingType;
};

export type LyraInteractionType = "brush" | "brush_y" | "brush_x" | "single" | "multi";
export type LyraMappingType = "color" | "opacity" | "size";

export const Interaction = Record<LyraInteraction>({
  id: null,
  groupId: null,
  interactionType: null,
  mappingType: null,
}, 'LyraInteraction');

export type InteractionRecord = RecordOf<LyraInteraction>;
export type InteractionState = Map<string, InteractionRecord>;
