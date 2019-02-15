// TODO(jzong): this probably should be moved to store/factory

import {Map, Record, RecordOf} from 'immutable';
import {Signal as VegaSignal} from 'vega-typings/types';

const dl = require('datalib');
const ns = require('../../util/ns');

const SELECTED = ns('selected');
const MODE = ns('mode');
const ANCHOR = ns('anchor');
const DELTA = ns('delta');
const CURSOR = 'cursor';  // Special vega signal, don't namespace.
const CELL = ns('cell');
const MOUSE = ns('mouse');

export type LyraSignal = {
  _idx: number
} & VegaSignal;

export const Signal = Record<LyraSignal>({
  _idx: null,
  name: null
});

export type SignalRecord = RecordOf<LyraSignal>;

export type SignalState = Map<string, SignalRecord>;

export const defaultSignalState: SignalState = Map({
  SELECTED: Signal({
    name: SELECTED,
    value: {mark: {}},
    on: [
      {events: 'mousedown[eventItem().mark && eventItem().mark.name &&' +
          'eventItem().mark.name !== ' + dl.str(CELL) + ']',
        update: 'eventItem()'},
      {events: 'mousedown[!eventItem().mark]', update: '{mark: {}}'}
    ],
    _idx: 0
  }),
  MODE: Signal({
    name: MODE,
    value: 'handles',
    _idx: 1
  }),
  DELTA: Signal({
    name: DELTA,
    value: 0,
    on: [
      {events: '[mousedown, window:mouseup] > window:mousemove',
        update: '{x: eventX() - lyra_anchor.x, y: eventY() - lyra_anchor.y}'}
    ],
    _idx: 2
  }),
  ANCHOR: Signal({
    name: ANCHOR,
    value: 0,
    on: [
      {events: 'mousedown',
        update: '{x: eventX(), y: eventY(), target: eventItem()}'},
      {events: '[mousedown, window:mouseup] > window:mousemove',
        update: '{x: eventX(), y: eventY(), target: lyra_anchor.target}'}
    ],
    _idx: 3
  }),
  CELL: Signal({
    name: CELL,
    value: {},
    on: [
      {events: '@' + CELL + ':dragover', update: 'eventItem()'},
      {events: '@' + CELL + ':dragleave', update: '{}'},
      // {events: '@'+CELL+':mouseover', update: 'eventItem()'},
      // {events: '@'+CELL+':mouseout',  update: '{}'}
    ],
    _idx: 4
  }),
  MOUSE: Signal({
    name: MOUSE,
    value: {},
    on: [
      {events: 'mousemove, dragover', update: '{x: eventX(), y: eventY()}'}
    ],
    _idx: 5
  }),
  CURSOR: Signal({
    name: CURSOR,
    on: [
      {events: 'mousedown', update: "eventItem() && eventItem().cursor || 'default'"},
      {events: 'mouseup', update: "'default'"}
    ]
  })
});

module.exports = {
  signals: defaultSignalState,
  names: [SELECTED, MODE, ANCHOR, DELTA, CELL, MOUSE, CURSOR],
  signalNames: {
    SELECTED: SELECTED,
    MODE: MODE,
    ANCHOR: ANCHOR,
    DELTA: DELTA,
    CURSOR: CURSOR,
    CELL: CELL,
    MOUSE: MOUSE
  }
};
