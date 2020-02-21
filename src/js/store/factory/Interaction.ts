import {Map, Record, RecordOf} from 'immutable';
import InteractionPreview from '../../components/interactions/InteractionPreview';
import {Signal} from 'vega';

export interface PropertyValues {
  size: number,
  opacity: number,
  color: string,
}
export interface LyraInteraction {
  id: number;
  name: string;
  groupId: number;
  selectionDef: LyraSelectionDef;
  applicationDef: LyraApplicationDef;
  markPropertyValues: PropertyValues;
};

interface BaseLyraInteractionDef {
  id: string;
  label: string;
  ref?: React.RefObject<InteractionPreview>;
}

interface BaseLyraSelectionDef {
  signals: Signal[];
}

export type LyraPointSelectionDef = {
  type: 'point';

} & BaseLyraSelectionDef & BaseLyraInteractionDef;

export type LyraIntervalSelectionDef = {
  type: 'interval';
} & BaseLyraSelectionDef & BaseLyraInteractionDef;

export type LyraSelectionDef = LyraPointSelectionDef | LyraIntervalSelectionDef;

interface BaseLyraApplicationDef {
  groupName: string; // which group does this application affect? (for filters, different from the group it's attached to)
}

export type LyraMarkApplicationDef = {
  type: 'mark';
  markName: string; // which mark does this application affect?
  markProperties: any; // partial mark spec object
} & BaseLyraApplicationDef & BaseLyraInteractionDef;

export type LyraScaleApplicationDef = {
  type: 'scale';
  scaleProperties: any[]; // list of partial scale objects
} & BaseLyraApplicationDef & BaseLyraInteractionDef;

export type LyraTransformApplicationDef = {
  type: 'transform';
  markProperties: any; // partial mark object,
  datasetProperties: any; // partial dataset object
} & BaseLyraApplicationDef & BaseLyraInteractionDef;

export type LyraApplicationDef = LyraMarkApplicationDef | LyraScaleApplicationDef | LyraTransformApplicationDef;

export const Interaction = Record<LyraInteraction>({
  id: null,
  name: null,
  groupId: null,
  selectionDef: null,
  applicationDef: null,
  markPropertyValues: {size: 10, opacity: 0.2, color: '#666666'}
}, 'LyraInteraction');

export type InteractionRecord = RecordOf<LyraInteraction>;
export type InteractionState = Map<string, InteractionRecord>;
