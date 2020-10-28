import {Record, RecordOf} from 'immutable';
import {SymbolMark} from 'vega-typings';
import anchorTarget from '../../../util/anchor-target';
import {propSg} from '../../../util/prop-signal';
import test from '../../../util/test-if';
import {HandleStreams, LyraMarkMeta} from '../Mark';
import {DELTA} from '../Signal';
import {SymbolShape} from 'vega-typings';

export type LyraSymbolMark = LyraMarkMeta & SymbolMark;

export const Symbol = Record<LyraSymbolMark>({
  _id: null,
  _parent: null,
  _vlUnit: null,
  type: 'symbol',
  name: null,
  from: null,
  encode: {
    update: {
      size: {value: 200},
      shape: {value: 'circle'}
    }
  }
}, 'LyraSymbolMark');

export type SymbolRecord = RecordOf<LyraSymbolMark>;
export const SymbolShapes: SymbolShape[] = [
  'circle',
  'square',
  'cross',
  'diamond',
  'triangle-up',
  'triangle-down'
];

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
export function getHandleStreams(symbol: SymbolRecord): HandleStreams {
  const at = anchorTarget.bind(null, symbol, 'handles');
  const id = symbol._id;
  const x = propSg(id, 'symbol', 'x');
  const y = propSg(id, 'symbol', 'y');
  const size = propSg(id, 'symbol', 'size');
  const DX = `${DELTA}.x`;
  const DY = `${DELTA}.y`;

  return {
    [x]: [{
      events: {signal: DELTA}, update: test(at(), `${x} + ${DX}`, x, id)
    }],
    [y]: [{
      events: {signal: DELTA}, update: test(at(), `${y} + ${DY}`, y, id)
    }],
    [size]: [
      {events: {signal: DELTA}, update: test(at('top'), `${size} - (${DY} << 5)`, size, id)},
      {events: {signal: DELTA}, update: test(at('bottom'), `${size} + (${DY} << 5)`, size, id)}
    ]
  };
};
