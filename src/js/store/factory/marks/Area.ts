'use strict';

import {Record, RecordOf} from 'immutable';
import {AreaMark, OnEvent} from 'vega-typings';
import {HandleStreams} from '../Mark';
import {SignalRecord} from '../Signal';

const anchorTarget = require('../../../util/anchor-target');
const test = require('../../../util/test-if');
const propSg = require('../../../util/prop-signal');

export type LyraAreaMark = {
  _id: number;
  _parent: number;
} & AreaMark;

export const Area = Record<LyraAreaMark>({
  _id: null,
  _parent: null,
  type: 'area',
  encode: {
    update: {
      // x2: {value: 0},
      y2: {value: 0},
      tension: {value: 13},
      interpolate: {value: 'monotone'},
      orient: {value: 'vertical'}
    }
  }
});

export type AreaRecord = RecordOf<LyraAreaMark>;

/**
 * Return an array of handle signal stream definitions to be instantiated.
 *
 * The returned object is used to initialize the interaction logic for the mark's
 * handle manipulators. This involves setting the mark's property signals
 * {@link https://github.com/vega/vega/wiki/Signals|streams}.
 *
 * @param {Object} area - A area properties object or instantiated area mark
 * @param {number} area._id - A numeric mark ID
 * @param {string} area.type - A mark type, presumably "area"
 * @returns {Object} A dictionary of stream definitions keyed by signal name
 */
export function getHandleStreams(area: AreaRecord): HandleStreams {
  const sg = require('../../../ctrl/signals');
  const at = anchorTarget.bind(null, area, 'handles');
  const id = area._id;
  const x  = propSg(id, 'area', 'x');
  const xc = propSg(id, 'area', 'xc');
  const x2 = propSg(id, 'area', 'x2');
  const y  = propSg(id, 'area', 'y');
  const yc = propSg(id, 'area', 'yc');
  const y2 = propSg(id, 'area', 'y2');
  const w = propSg(id, 'area', 'width');
  const h = propSg(id, 'area', 'height');
  const DELTA: string = sg.DELTA;
  const DX = DELTA + '.x';
  const DY = DELTA + '.y';
  const streams: HandleStreams = {};

  streams[x] = [{
    events: {signal: DELTA}, update: test(at() + '||' + at('left'), x + '+' + DX, x)
  }];
  streams[xc] = [{
    events: {signal: DELTA}, update: test(at() + '||' + at('left'), xc + '+' + DX, xc)
  }];
  streams[x2] = [{
    events: {signal: DELTA}, update: test(at() + '||' + at('right'), x2 + '+' + DX, x2)
  }];
  streams[y] = [{
    events: {signal: DELTA}, update: test(at() + '||' + at('top'), y + '+' + DY, y)
  }];
  streams[yc] = [{
    events: {signal: DELTA}, update: test(at() + '||' + at('top'), yc + '+' + DY, yc)
  }];
  streams[y2] = [{
    events: {signal: DELTA}, update: test(at() + '||' + at('bottom'), y2 + '+' + DY, y2)
  }];
  streams[w] = [
    {events: {signal: DELTA}, update: test(at('left'), w + '-' + DX, w)},
    {events: {signal: DELTA}, update: test(at('right'), w + '+' + DX, w)}
  ];
  streams[h] = [
    {events: {signal: DELTA}, update: test(at('top'), h + '-' + DY, h)},
    {events: {signal: DELTA}, update: test(at('bottom'), h + '+' + DY, h)}
  ];
  return streams;
};
