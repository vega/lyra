import {Map} from 'immutable';

export interface LyraVegaFlags {
  invalid: boolean,
  isParsing: boolean
}

export type VegaFlagsState = Map<keyof LyraVegaFlags, boolean>;
