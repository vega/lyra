vde.Vis.marks.Symbol = (function() {
  var symbol = function(name, groupName) {
    vde.Vis.Mark.call(this, name, groupName);

    this.type = 'symbol';

    this.properties = {
      x: {value: 0},
      y: {value: 0},

      size: {value: 100},
      shape: {value: 'cross'},

      fill: {value: '#4682b4'},
      fillOpacity: {value: 1},
      stroke: {value: '#000000'},
      strokeWidth: {value: 0}
    };

    this.connectors = {'center': {}};

    return this.init();
  };

  symbol.prototype = new vde.Vis.Mark();
  var prototype  = symbol.prototype;
  var geomOffset = 7;

  prototype.productionRules = function(prop, scale, field) {
    switch(prop) {
      case 'size':
        scale = this.group().scale(this, {
          type: 'linear',
          field: field
        }, {range: [50, 1000]}, 'size');
      break;
    }

    return [scale, field];
  };

  prototype.selected = function() {
    var self = this, 
        item = this.item(vde.iVis.activeItem),
        props = this.properties;

    var mousemove = function() {
      var dragging = vde.iVis.dragging, evt = d3.event;
      if(!dragging || !dragging.prev) return;
      if(vde.iVis.activeMark != self) return;

      var handle = (dragging.item.mark.def.name == 'handle'),
          dx = Math.ceil(evt.pageX - dragging.prev[0]),
          dy = Math.ceil(evt.pageY - dragging.prev[1]),
          data = dragging.item.datum.data;

      if(!handle) return;

      vde.iVis.ngScope().$apply(function() { 
        props.size.value += dx*10; 
        self.update('size'); 
      }); 

      dragging.prev = [evt.pageX, evt.pageY];
      vde.iVis.show('handle');
    };

    vde.iVis.interactor('handle', this.handles(item), {mousemove: mousemove});
  };  

  prototype.helper = function(property) {
    var item = this.item(vde.iVis.activeItem);
    if(['x', 'y', 'size'].indexOf(property) == -1) return;

    vde.iVis.interactor('point', [this.connectors['center'].coords(item)]);
    vde.iVis.interactor('span', this.spans(item, property));
    vde.iVis.show(['point', 'span']);
  }

  prototype.coordinates = function(connector, item, def) {
    if(!item) item = this.item(vde.iVis.activeItem);
    var b = vde.iVis.translatedBounds(item, item.bounds);
    
    var coord = {
      x: b.x1 + (b.width()/2), 
      y: b.y1 + (b.height()/2), 
      cursor: 'se-resize',
      connector: connector
    };
    for(var k in def) coord[k] = def[k];

    return coord;
  }

  prototype.handles = function(item) {
    var b = vde.iVis.translatedBounds(item, item.bounds),
        pt = this.connectors['center'].coords(item, {disabled: 0});

    if(this.properties.size.field) pt.disabled = 1;

    return [pt];
  };

  prototype.spans = function(item, property) {
    var props = this.properties,
        b  = vde.iVis.translatedBounds(item, item.bounds),
        gb = vde.iVis.translatedBounds(item.mark.group, item.mark.group.bounds),
        go = 3*geomOffset, io = geomOffset,
        pt = this.connectors['center'].coords(item); // offsets   

    switch(property) {
      case 'x':
        return [{x: (gb.x1-go), y: (pt.y+io), span: 'x_0'}, {x: pt.x, y: (pt.y+io), span: 'x_0'}];
      break;

      case 'y': return (props.y.scale && props.y.scale.range().name == 'height') ?
        [{x: (pt.x+io), y: (gb.y2+go)}, {x: (pt.x+io), y: (pt.y)}]
      :
        [{x: (pt.x+io), y: (gb.y1-go)}, {x: (pt.x+io), y: (pt.y)}]
      break;

      case 'size':
        return [{x: b.x1, y: b.y1-io, span: 'size_0'}, {x: b.x2, y: b.y1-io, span: 'size_0'},
        {x: b.x2+io, y: b.y1, span: 'size_1'}, {x: b.x2+io, y: b.y2, span: 'size_1'}];
      break;
    } 
  };

  return symbol;
})();