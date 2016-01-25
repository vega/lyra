var dl = require('datalib'),
    Base = require('./Manipulators'),
    spec = require('../../model/primitives/marks/manipulators'),
    CONST = spec.CONST,
    PX = CONST.PADDING, SP = CONST.STROKE_PADDING, A = CONST.ARROWHEAD;

function RectManipulators(graph) {
  return Base.call(this, graph);
}

var prototype = (RectManipulators.prototype = Object.create(Base.prototype));
prototype.constructor = RectManipulators;

function compile(manipulator) {
  return function(item) {
    var b = item.bounds,
        c = spec.coords(b), 
        size = spec.size(b),
        data = [], d;

    for (var k in c) {
      if (manipulator === 'handle' && k === 'midCenter') continue;
      data.push(d=c[k]);
      d.size = size;
      d.key  = k;
      d.manipulator = manipulator;
    }
    return data;
  };
}

prototype.handles = function(item) {
  var c = spec.coords(item.bounds, 'handle');
  return dl.vals(c).filter(function(x) { return x.key !== 'midCenter' });
};

prototype.connectors = function(item) {
  return dl.vals(spec.coords(item.bounds, 'connector'));
};

function map(key, manipulator) {
  return function(d) { 
    d.key = key;
    d.manipulator = manipulator;
    return d;
  };
}

prototype.channels = function(item) {
  var b  = item.bounds,
      c  = spec.coords(b),
      tl = c.topLeft,
      tr = c.topRight,
      br = c.bottomRight,
      w  = b.width(), h = b.height();

  return []
    // Width/horizontal arrow stem
    .concat([ 
      {x: tl.x, y: tl.y-SP}, {x: tr.x, y: tr.y-SP}, {x: tr.x+w, y: tr.y-SP},
      {x: tr.x+w-A, y: tr.y-2*SP}, {x: tr.x+w-A, y: tr.y},
      {x: tr.x+w, y: tr.y-SP+0.1}
    ].map(map('x+', 'arrow')))
    // Height/vertical arrow stem
    .concat([ 
      {x: tr.x+PX, y: tr.y}, {x: br.x+PX, y: br.y}, {x: br.x+PX, y: br.y+h},
      {x: br.x+2*PX, y: br.y+h-A}, {x: br.x, y: br.y+h-A}, 
      {x: br.x+PX, y: br.y+h+0.1}
    ].map(map('y+', 'arrow')));
};

prototype.altchannels = function(item) {
  var b  = item.bounds,
      gb = item.mark.group.bounds,
      c  = spec.coords(b),
      tl = c.topLeft, tc = c.topCenter, tr = c.topRight,
      ml = c.midLeft, mr = c.midRight, 
      bl = c.bottomLeft, bc = c.bottomCenter, br = c.bottomRight;

  return []
    // x
    .concat([ 
      {x: gb.x1, y: tl.y}, {x: tl.x-PX, y: tl.y}      
    ].map(map('x', 'span')))
    // x2
    .concat([ 
      {x: gb.x1, y: br.y+SP}, {x: bl.x, y: br.y+SP},  
      {x: br.x, y: br.y+SP}
    ].map(map('x2', 'span')))
    // y
    .concat([ 
      {x: tl.x, y: gb.y1}, {x: tl.x, y: tl.y-SP}      
    ].map(map('y', 'span')))
    // y2
    .concat([ 
      {x: br.x+SP, y: gb.y1}, {x: br.x+SP, y: tr.y},  
      {x: br.x+SP, y: br.y}
    ].map(map('y2', 'span')))
    // width
    .concat([ml, mr].map(map('width', 'span')))  
    // height
    .concat([tc, bc].map(map('height', 'span'))); 
};

module.exports = RectManipulators;