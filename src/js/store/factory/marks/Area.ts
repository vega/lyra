'use strict';

import {Record, RecordOf} from 'immutable';
import {AreaMark} from 'vega-typings';
import anchorTarget from '../../../util/anchor-target';
import {propSg} from '../../../util/prop-signal';
import test from '../../../util/test-if';
import {HandleStreams, LyraMarkMeta} from '../Mark';
import {DELTA} from '../Signal';

export type LyraAreaMark = LyraMarkMeta & AreaMark;

export const Area = Record<LyraAreaMark>({
  _id: null,
  _parent: null,
  _vlUnit: null,
  type: 'area',
  name: null,
  from: null,
  encode: {
    update: {
      x2: {value: 250},
      y2: {value: 250},
      xc: {value: 70, _disabled: true},
      yc: {value: 70, _disabled: true},
      width: {value: 40, _disabled: true},
      height: {value: 40, _disabled: true},
      tension: {value: 13},
      interpolate: {value: 'monotone'},
      orient: {value: 'vertical'}
    }
  }
}, 'LyraAreaMark');

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
  const DX = `${DELTA}.x`;
  const DY = `${DELTA}.y`;

  return {
    [x]: [{
      events: {signal: DELTA}, update: test(`${at()} || ${at('left')}`, `${x} + ${DX}`, x, id)
    }],
    [xc]: [{
      events: {signal: DELTA}, update: test(`${at()} || ${at('left')}`, `${xc} + ${DX}`, xc, id)
    }],
    [x2]: [{
      events: {signal: DELTA}, update: test(`${at()} || ${at('right')}`, `${x2} + ${DX}`, x2, id)
    }],
    [y]: [{
      events: {signal: DELTA}, update: test(`${at()} || ${at('top')}`,`${ y} + ${DY}`, y, id)
    }],
    [yc]: [{
      events: {signal: DELTA}, update: test(`${at()} || ${at('top')}`, `${yc} + ${DY}`, yc, id)
    }],
    [y2]: [{
      events: {signal: DELTA}, update: test(`${at()} || ${at('bottom')}`, `${y2} + ${DY}`, y2, id)
    }],
    [w]: [
      {events: {signal: DELTA}, update: test(at('left'), `${w} - ${DX}`, w, id)},
      {events: {signal: DELTA}, update: test(at('right'), `${w} + ${DX}`, w, id)}
    ],
    [h]: [
      {events: {signal: DELTA}, update: test(at('top'), `${h} - ${DY}`, h, id)},
      {events: {signal: DELTA}, update: test(at('bottom'), `${h} + ${DY}`, h, id)}
    ]
  };
};
