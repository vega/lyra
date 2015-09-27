var ns = require('./').ns,
    signals = {};

var SELECTED = ns('selected'),
    MANIPULATORS = ns('manipulators'),
    ANCHOR = ns('anchor'),
    DELTA  = ns('delta'),
    CELL = ns('cell');

signals[SELECTED] = {
  name: SELECTED,
  init: {mark: {}},
  streams: [
    { type: 'mousedown[eventItem().mark && eventItem().mark.name]', 
      expr: 'eventItem()' },
    { type: 'mousedown[!eventItem().mark]', expr: '{mark: {}}' }
  ],
  _idx: 0
};

signals[MANIPULATORS] = {
  name: MANIPULATORS, 
  init: 'handles',
  _idx: 1
};

signals[DELTA] = {
  name: DELTA,
  init: 0,
  streams: [
    { type: '[mousedown, window:mouseup] > window:mousemove',
      expr: '{x: eventX() - lyra_anchor.x, y: eventY() - lyra_anchor.y}' }
  ],
  _idx: 2
};

signals[ANCHOR] = {
  name: ANCHOR,
  init: 0,
  streams: [
    { type: 'mousedown', 
      expr: '{x: eventX(), y: eventY(), target: eventItem()}' },
    { type: '[mousedown, window:mouseup] > window:mousemove', 
      expr: '{x: eventX(), y: eventY(), target: lyra_anchor.target}' }
  ],
  _idx: 3
};

signals[CELL] = {
  name: CELL,
  init: null,
  streams: [
    {type: '@'+CELL+':mouseover', expr: 'eventItem().key'},
    {type: '@'+CELL+':mouseout',  expr: 'null'}
  ],
  _idx: 4
};

module.exports = {
  signals: signals,
  names: [SELECTED, MANIPULATORS, ANCHOR, DELTA],
  SELECTED: SELECTED,
  MANIPULATORS: MANIPULATORS,
  ANCHOR: ANCHOR,
  DELTA:  DELTA,
  CELL: CELL
};