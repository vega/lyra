import {Record, RecordOf} from 'immutable';

export interface LyraGlobals {
  idCounter: number // global counter for unique ids
}

export const LyraGlobals = Record<LyraGlobals>({
  idCounter: 1
}, 'LyraGlobals');

export type LyraGlobalsRecord = RecordOf<LyraGlobals>;
