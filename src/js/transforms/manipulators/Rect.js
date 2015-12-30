var dl = require('datalib'),
    Base = require('./Manipulators'),
    spec = require('../../model/primitives/marks/manipulators'),
    SIZES = spec.SIZES;

function RectManipulators(graph) {
  return Base.call(this, graph);
}

var prototype = (RectManipulators.prototype = Object.create(Base.prototype));
prototype.constructor = RectManipulators;

function coords(item) {
  var b = item.bounds;
  return {
    topLeft:   {x: b.x1, y: b.y1, cursor: 'nw-resize'},
    topCenter: {x: b.x1 + (b.width()/2), y: b.y1, cursor: 'n-resize'},
    topRight:  {x: b.x2, y: b.y1, cursor: 'ne-resize'},
    midLeft:   {x: b.x1, y: b.y1 + (b.height()/2), cursor: 'w-resize'},
    midCenter: {x: b.x1 + (b.width()/2), y: b.y1 + (b.height()/2), cursor: 'move'},
    midRight:  {x: b.x2, y: b.y1 + (b.height()/2), cursor: 'e-resize'},
    bottomLeft:   {x: b.x1, y: b.y2, cursor: 'sw-resize'},
    bottomCenter: {x: b.x1 + (b.width()/2), y: b.y2, cursor: 's-resize'},
    bottomRight:  {x: b.x2, y: b.y2, cursor: 'se-resize'}
  };
}

function compile(kind) {
  return function(item) {
    var b = item.bounds,
        c = coords(item), 
        data = [],
        size = b.width() < 20 || b.height() < 20 ? SIZES.SMALL : SIZES.LARGE;

    for (var k in c) {
      if (kind === 'handles' && k === 'midCenter') continue;
      data.push(dl.extend(c[k], {key: k, size: size}));
    }
    return data;
  };
}

prototype.handles = compile('handles');
prototype.connectors = compile('connectors');

// padding, stroke-padding, arrowhead
var px = 5, sp = 7, a = 7;  
function key(k) {
  return function(d) { return (d.key = k, d); };
}

prototype.arrows = function(item) {
  var b = item.bounds,
      c = coords(item),
      tl = c.topLeft,
      tr = c.topRight,
      br = c.bottomRight,
      w = b.width(), h = b.height();

  return []
    // Width/horizontal arrow stem
    .concat([ 
      {x: tl.x, y: tl.y-sp}, {x: tr.x, y: tr.y-sp}, {x: tr.x+w, y: tr.y-sp},
      {x: tr.x+w-a, y: tr.y-2*sp}, {x: tr.x+w-a, y: tr.y},
      {x: tr.x+w, y: tr.y-sp+0.1}
    ].map(key('rx')))
    // Height/vertical arrow stem
    .concat([ 
      {x: tr.x+px, y: tr.y}, {x: br.x+px, y: br.y}, {x: br.x+px, y: br.y+h},
      {x: br.x+2*px, y: br.y+h-a}, {x: br.x, y: br.y+h-a}, 
      {x: br.x+px, y: br.y+h+0.1}
    ].map(key('ry')));
};

prototype.spans = function(item) {
  var b  = item.bounds,
      gb = item.mark.group.bounds,
      c  = coords(item),
      tl = c.topLeft, tc = c.topCenter, tr = c.topRight,
      ml = c.midLeft, mr = c.midRight, 
      bl = c.bottomLeft, bc = c.bottomCenter, br = c.bottomRight;

  return []
    // x
    .concat([ 
      {x: gb.x1, y: tl.y}, {x: tl.x-px, y: tl.y}      
    ].map(key('rx')))
    // x2
    .concat([ 
      {x: gb.x1, y: br.y+sp}, {x: bl.x, y: br.y+sp},  
      {x: br.x, y: br.y+sp}
    ].map(key('rx2')))
    // y
    .concat([ 
      {x: tl.x, y: gb.y1}, {x: tl.x, y: tl.y-sp}      
    ].map(key('ry')))
    // y2
    .concat([ 
      {x: br.x+sp, y: gb.y1}, {x: br.x+sp, y: tr.y},  
      {x: br.x+sp, y: br.y}
    ].map(key('ry2')))
    // width
    .concat([ml, mr].map(key('rw')))  
    // height
    .concat([tc, bc].map(key('rh'))); 
};

module.exports = RectManipulators;