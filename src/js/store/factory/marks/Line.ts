import {Record, RecordOf} from 'immutable';
import {LineMark} from 'vega-typings';
import {HandleStreams} from '../Mark';

const anchorTarget = require('../../../util/anchor-target');
const test = require('../../../util/test-if');
const propSg = require('../../../util/prop-signal');

export type LyraLineMark = {
  _id: number;
  _parent: number;
} & LineMark;

export const Line = Record<LyraLineMark>({
  _id: null,
  _parent: null,
  type: 'line',
  encode: {
    update: {
      fill: undefined,
      fillOpacity: undefined,
      strokeWidth: {value: 3},
      tension: {value: 13},
      interpolate: {value: 'monotone'}
    }
  }
});

export type LineRecord = RecordOf<LyraLineMark>;

/**
 * Return an array of handle signal stream definitions to be instantiated.
 *
 * The returned object is used to initialize the interaction logic for the mark's
 * handle manipulators. This involves setting the mark's property signals
 * {@link https://github.com/vega/vega/wiki/Signals|streams}.
 *
 * @param {Object} line - A line properties object or instantiated line mark
 * @param {number} line._id - A numeric mark ID
 * @param {string} line.type - A mark type, presumably "line"
 * @returns {Object} A dictionary of stream definitions keyed by signal name
 */
export function getHandleStreams(line: LineRecord): HandleStreams {
  const sg = require('../../../ctrl/signals');
  const at = anchorTarget.bind(null, line, 'handles');
  const id = line._id;
  const x = propSg(id, 'line', 'x');
  const y = propSg(id, 'line', 'y');
  const DELTA = sg.DELTA;
  const DX = DELTA + '.x';
  const DY = DELTA + '.y';
  const streams: HandleStreams = {};

  streams[x] = [{
    events: DELTA, update: test(at(), x + '+' + DX, x)
  }];
  streams[y] = [{
    events: DELTA, update: test(at(), y + '+' + DY, y)
  }];
  return streams;
};
