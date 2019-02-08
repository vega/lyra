import {Record, RecordOf} from 'immutable';
import {OnEvent, TextMark} from 'vega-typings';

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
export function getHandleStreams(text: TextRecord): {[s: string]: OnEvent[];} {
  const sg = require('../../../ctrl/signals');
  const at = anchorTarget.bind(null, text, 'handles');
  const id = text._id;
  const x = propSg(id, 'text', 'x');
  const y = propSg(id, 'text', 'y');
  const fontSize = propSg(id, 'text', 'fontSize');
  const DELTA = sg.DELTA;
  const DX = DELTA + '.x';
  const DY = DELTA + '.y';
  const streams: {[s: string]: OnEvent[];} = {};

  streams[x] = [{
    events: DELTA, update: test(at(), x + '+' + DX, x)
  }];
  streams[y] = [{
    events: DELTA, update: test(at(), y + '+' + DY, y)
  }];
  // Allow upper-left and lower-right handles to control font size
  streams[fontSize] = [
    {events: DELTA, update: test(at('left') + '&&' + at('top'), fontSize + '-' + DX, fontSize)},
    {events: DELTA, update: test(at('right') + '&&' + at('bottom'), fontSize + '+' + DX, fontSize)},
    {events: DELTA, update: test(at('left') + '&&' + at('top'), fontSize + '-' + DY, fontSize)},
    {events: DELTA, update: test(at('right') + '&&' + at('bottom'), fontSize + '+' + DY, fontSize)}
  ];
  return streams;
};
