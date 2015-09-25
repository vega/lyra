var Base = require('./Manipulators');

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

prototype.handles = function(item) {
  var c = coords(item), data = [];
  for (var k in c) {
    if (k === 'midCenter') continue;
    data.push(dl.extend(c[k], {key: k}));
  }
  return data;
};

module.exports = RectManipulators;