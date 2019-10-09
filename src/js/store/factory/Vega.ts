import {Record, RecordOf} from 'immutable';

export interface LyraVegaReparse {
  invalid: boolean,
  isParsing: boolean
}

export const VegaReparse = Record<LyraVegaReparse>({
  invalid: false,
  isParsing: false
}, 'LyraVegaReparse');

export type VegaReparseRecord = RecordOf<LyraVegaReparse>;
