import {Record, RecordOf} from 'immutable';
import {TextMark, Align, Baseline, FontStyle, FontWeight} from 'vega-typings';
import {HandleStreams} from '../Mark';
import {signalNames} from '../Signal';

const anchorTarget = require('../../../util/anchor-target');
const test = require('../../../util/test-if');
const propSg = require('../../../util/prop-signal');

export type LyraTextMark = {
  _id: number;
  _parent: number;
} & TextMark;

export const Text = Record<LyraTextMark>({
  _id: null,
  _parent: null,
  type: 'text',
  encode: {
    update: {
      dx: {value: 0, offset: 0},
      dy: {value: 0, offset: 0},
      text: {value: 'Text'},
      align: {value: 'center'},
      baseline: {value: 'middle'},
      font: {value: 'Helvetica'},
      fontSize: {value: 14},
      fontStyle: {value: 'normal'},
      fontWeight: {value: 'normal'},
      angle: {value: 0}
    }
  }
});

export type TextRecord = RecordOf<LyraTextMark>;

/**
 * Return an array of handle signal stream definitions to be instantiated.
 *
 * The returned object is used to initialize the interaction logic for the mark's
 * handle manipulators. This involves setting the mark's property signals
 * {@link https://github.com/vega/vega/wiki/Signals|streams}.
 *
 * @param {Object} text - A text properties object or instantiated text mark
 * @param {number} text._id - A numeric mark ID
 * @param {string} text.type - A mark type, presumably "text"
 * @returns {Object} A dictionary of stream definitions keyed by signal name
 */
export function getHandleStreams(text: TextRecord): HandleStreams {
  const at = anchorTarget.bind(null, text, 'handles');
  const id = text._id;
  const x = propSg(id, 'text', 'x');
  const y = propSg(id, 'text', 'y');
  const fontSize = propSg(id, 'text', 'fontSize');
  const DELTA: string = signalNames.DELTA;
  const DX = DELTA + '.x';
  const DY = DELTA + '.y';
  const streams: HandleStreams = {};

  streams[x] = [{
    events: {signal: DELTA}, update: test(at(), x + '+' + DX, x)
  }];
  streams[y] = [{
    events: {signal: DELTA}, update: test(at(), y + '+' + DY, y)
  }];
  // Allow upper-left and lower-right handles to control font size
  streams[fontSize] = [
    {events: {signal: DELTA}, update: test(at('left') + '&&' + at('top'), fontSize + '-' + DX, fontSize)},
    {events: {signal: DELTA}, update: test(at('right') + '&&' + at('bottom'), fontSize + '+' + DX, fontSize)},
    {events: {signal: DELTA}, update: test(at('left') + '&&' + at('top'), fontSize + '-' + DY, fontSize)},
    {events: {signal: DELTA}, update: test(at('right') + '&&' + at('bottom'), fontSize + '+' + DY, fontSize)}
  ];
  return streams;
};

export const TextAlignments: Align[] = ['left', 'center', 'right'];
export const TextBaselines: Baseline[] = ['top', 'middle', 'bottom'];
export const TextFonts = ['Helvetica', 'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Trebuchet MS'];
export const TextFontStyles: FontStyle[] = ['normal', 'italic'];
export const TextFontWeights: FontWeight[] = ['normal', 'bold'];
