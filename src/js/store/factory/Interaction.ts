import {Map, Record, RecordOf} from 'immutable';

export interface LyraInteraction {
  id: number;
  name: string;
  groupId: number;
  selectionType: LyraSelectionType;
  mappingType: LyraMappingType;
};

export type LyraSelectionType = "brush" | "brush_y" | "brush_x" | "single" | "multi";
export type LyraMappingType = "color" | "opacity" | "size" | "text" | "panzoom";

export const Interaction = Record<LyraInteraction>({
  id: null,
  name: null,
  groupId: null,
  selectionType: null,
  mappingType: null,
}, 'LyraInteraction');

export type InteractionRecord = RecordOf<LyraInteraction>;
export type InteractionState = Map<string, InteractionRecord>;
