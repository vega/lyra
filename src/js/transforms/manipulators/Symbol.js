var dl = require('datalib'),
    Base = require('./Manipulators'),
    spec = require('../../model/primitives/marks/manipulators'),
    CONST = spec.CONST,
    PX = CONST.PADDING, SP = CONST.STROKE_PADDING;

function SymbolManipulators(graph) {
  return Base.call(this, graph);
}

var prototype = (SymbolManipulators.prototype = Object.create(Base.prototype));
prototype.constructor = SymbolManipulators;

prototype.handles = function(item) {
  var c = spec.coords(item.bounds, 'handle');
  return [
    c.topLeft, c.topRight,
    c.bottomLeft, c.bottomRight
  ];
}

prototype.connectors = function(item) {
  var c = spec.coords(item.bounds, 'connector');
  return [c.midCenter];
};

function map(key, manipulator) {
  return function(d) {
    d.key = key;
    d.manipulator = manipulator;
    return d;
  };
}

prototype.channels = prototype.altchannels = function(item) {
  var b  = item.bounds,
      gb = item.mark.group.bounds,
      c  = spec.coords(b),
      m  = c.midCenter;

  return []
    // x
    .concat([
      {x: gb.x1, y: m.y}, {x: m.x-PX, y: m.y}
    ].map(map('x', 'span')))
    // y
    .concat([
      {x: m.x, y: gb.y1}, {x: m.x, y: m.y-SP}
    ].map(map('y', 'span')));
};

module.exports = SymbolManipulators;
