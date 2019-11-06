import {Map, Record, RecordOf} from 'immutable';

export interface LyraInteraction {
  id: number;
  name: string;
  groupId: number;
  interactionType: LyraInteractionType;
  mappingType: LyraMappingType;
};

export type LyraInteractionType = "brush" | "brush_y" | "brush_x" | "single" | "multi";
export type LyraMappingType = "color" | "opacity" | "size" | "text" | "panzoom";

export const Interaction = Record<LyraInteraction>({
  id: null,
  name: null,
  groupId: null,
  interactionType: null,
  mappingType: null,
}, 'LyraInteraction');

export type InteractionRecord = RecordOf<LyraInteraction>;
export type InteractionState = Map<string, InteractionRecord>;
