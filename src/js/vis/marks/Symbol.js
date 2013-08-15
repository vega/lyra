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

    return this.init();
  };

  symbol.prototype = new vde.Vis.Mark();
  var prototype  = symbol.prototype;

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
        item = vde.iVis.activeItem, 
        props = this.properties;
    if(!item.key) item = this.item(item);

    var positions = function() {
      var b = vde.iVis.translatedBounds(item, item.bounds),
          pt   = {x: b.x1 + (b.width()/2), y: b.y1 + (b.height()/2), cursor: 'se-resize', disabled: 0};

      if(self.properties.size.field) pt.disabled = 1;

      return [pt];
    }; 

    var mousemove = function() {
      var dragging = vde.iVis.dragging, evt = d3.event;
      if(!dragging) return;
      if(vde.iVis.activeMark != self) return;

      var handle = (dragging.item.mark.def.name == 'handle'),
          dx = Math.ceil(evt.pageX - dragging.prev[0]),
          dy = Math.ceil(evt.pageY - dragging.prev[1]),
          data = dragging.item.datum.data;

      if(!handle) return;

      self.ngScope().$apply(function() { 
        props.size.value += dx*10; 
        self.update('size'); 
      }); 

      dragging.prev = [evt.pageX, evt.pageY];
      vde.iVis.view.data({ 'handle_data': positions() }).update();
    };

    vde.iVis.interactor('handle', positions(), {mousemove: mousemove});
  };  

  return symbol;
})();