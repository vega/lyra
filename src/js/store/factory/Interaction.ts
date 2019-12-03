import {Map, Record, RecordOf} from 'immutable';
import {LyraSelectionPreviewDef, LyraMappingPreviewDef} from '../../components/interactions/InteractionPreviewController';

export interface PropertyValues {
  size: number,
  opacity: number,
  color: string,
}
export interface LyraInteraction {
  id: number;
  name: string;
  groupId: number;
  selectionDef: LyraSelectionPreviewDef;
  mappingDef: LyraMappingPreviewDef;
  markPropertyValues: PropertyValues;
};

export const Interaction = Record<LyraInteraction>({
  id: null,
  name: null,
  groupId: null,
  selectionDef: null,
  mappingDef: null,
  markPropertyValues: {size: 10, opacity: 0.2, color: '#666666'}
}, 'LyraInteraction');

export type InteractionRecord = RecordOf<LyraInteraction>;
export type InteractionState = Map<string, InteractionRecord>;
