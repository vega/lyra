import {Record, RecordOf} from 'immutable';
import {data, WalkthroughData} from '../../walkthrough';

export type WalkthroughName = keyof WalkthroughData;

interface LyraWalkthrough {
  data: WalkthroughData;
  activeStep: number;
  activeWalkthrough: WalkthroughName;
}

export const Walkthrough = Record<LyraWalkthrough>({
  data: data,
  activeStep: 1,
  activeWalkthrough: null
}, 'LyraWalkthrough');

export type WalkthroughRecord = RecordOf<LyraWalkthrough>;
