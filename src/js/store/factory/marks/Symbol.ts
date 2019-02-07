import {Record, RecordOf} from 'immutable';
import {OnEvent, SymbolMark} from 'vega-typings';

const anchorTarget = require('../../../util/anchor-target');
const test = require('../../../util/test-if');
const propSg = require('../../../util/prop-signal');

export type LyraSymbolMark = {
  _id: number
} & SymbolMark;

export const Symbol = Record<LyraSymbolMark>({
  _id: null,
  type: 'symbol',
  encode: {
    update: {
      size: {value: 100},
      shape: {value: 'circle'}
    }
  }
});

export type SymbolRecord = RecordOf<LyraSymbolMark>;


/**
 * Return an array of handle signal stream definitions to be instantiated.
 *
 * The returned object is used to initialize the interaction logic for the mark's
 * handle manipulators. This involves setting the mark's property signals
 * {@link https://github.com/vega/vega/wiki/Signals|streams}.
 *
 * @param {Object} symbol - A symbol properties object or instantiated symbol mark
 * @param {number} symbol._id - A numeric mark ID
 * @param {string} symbol.type - A mark type, presumably "symbol"
 * @returns {Object} A dictionary of stream definitions keyed by signal name
 */
export function getHandleStreams(symbol: SymbolRecord): {[s: string]: OnEvent[];} {
  const sg = require('../../../ctrl/signals');
  const at = anchorTarget.bind(null, symbol, 'handles');
  const id = symbol._id;
  const x = propSg(id, 'symbol', 'x');
  const y = propSg(id, 'symbol', 'y');
  const size = propSg(id, 'symbol', 'size');
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
  streams[size] = [
    {events: DELTA, update: test(at('top'), size + '-(' + DY + '<<5)', size)},
    {events: DELTA, update: test(at('bottom'), size + '+(' + DY + '<<5)', size)}
  ];
  return streams;
};
