var dl = require('datalib'),
    ns = require('../../util').ns,
    signals = {};

var SELECTED = ns('selected'),
    MANIPULATORS = ns('manipulators'),
    ANCHOR = ns('anchor'),
    DELTA  = ns('delta'),
    CELL  = ns('cell'),
    MOUSE = ns('mouse');

signals[SELECTED] = {
  name: SELECTED,
  init: {mark: {}},
  streams: [
    { type: 'mousedown[eventItem().mark && eventItem().mark.name &&'+
        'eventItem().mark.name !== '+dl.str(CELL)+']', 
      expr: 'eventItem()' },
    { type: 'mousedown[!eventItem().mark]', expr: '{mark: {}}' }
  ],
  _idx: 0
};

signals[MANIPULATORS] = {
  name: MANIPULATORS, 
  init: 'handles',
  streams: [
    { type: 'window:keydown, window:keyup', 
      expr: 'if(lyra_manipulators === "arrows" || lyra_manipulators === "spans", ' + 
        'if(event.shiftKey && lyra_manipulators === "arrows", "spans", "arrows"), lyra_manipulators)'}
  ],
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
  init: {},
  streams: [
    {type: '@'+CELL+':mouseover', expr: 'eventItem()'},
    {type: '@'+CELL+':mouseout',  expr: '{}'}
  ],
  _idx: 4
};

signals[MOUSE] = {
  name: MOUSE,
  init: {},
  streams: [
    {type: 'window:mousemove', expr: '{x: eventX(), y: eventY()}'}
  ],
  _idx: 5
};

module.exports = {
  signals: signals,
  names: [SELECTED, MANIPULATORS, ANCHOR, DELTA],
  SELECTED: SELECTED,
  MANIPULATORS: MANIPULATORS,
  ANCHOR: ANCHOR,
  DELTA:  DELTA,
  CELL:  CELL,
  MOUSE: MOUSE
};