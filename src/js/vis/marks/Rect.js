vde.Vis.marks.Rect = (function() {
  var rect = function(name, groupName) {
    vde.Vis.Mark.call(this, name, groupName);

    this.type = 'rect';

    this.properties = {
      x: {value: 0},
      width: {value: 15},
      x2: {value: 0, disabled: true},
      y: {value: 0},
      height: {value: 150},
      y2: {value: 0, disabled: true},
      fill: {value: '#4682b4'},
      fillOpacity: {value: 1},
      stroke: {value: '#000000'},
      strokeWidth: {value: 0}
    };

    this.extents = {
      horizontal: {fields: ['x', 'x2', 'width'], limit: 2, history: ['x', 'width']},
      vertical: {fields: ['y', 'y2', 'height'],  limit: 2, history: ['y', 'height']}
    };

    return this.init();
  };

  rect.prototype = new vde.Vis.Mark();
  var prototype  = rect.prototype;

  prototype.productionRules = function(prop, scale, field) {
    if(!scale) {
      switch(prop) {
        case 'x':
        case 'x2':
        case 'width':
          scale = this.group().scale(this, {
            field: field
          }, {
            type: field.type || 'ordinal',
            range: new vde.Vis.Field('width')
          }, 'x');
        break;

        case 'y':
        case 'y2':
        case 'height':
          scale = this.group().scale(this, {
            field: field
          }, {
            type: field.type || 'linear',
            range: new vde.Vis.Field('height')
          }, 'y');
        break;
      }
    }

    if(scale.properties.type == 'ordinal')
      scale.properties.points = false;

    return [scale, field]
  };

  prototype.interactive = function() {
    var self = this, item = vde.iVis.activeItem;
    if(!item.key) item = this.item(item);

    var positions = function() {
      var b = vde.iVis.translatedBounds(item, item.bounds),
        top    = {x: b.x1 + (b.width()/2), y: b.y1,  pos: 'top',    cursor: 'n-resize', disabled: 1},
        bottom = {x: b.x1 + (b.width()/2), y: b.y2,  pos: 'bottom', cursor: 's-resize', disabled: 1},
        left   = {x: b.x1, y: b.y1 + (b.height()/2), pos: 'left',   cursor: 'w-resize', disabled: 1},
        right  = {x: b.x2, y: b.y1 + (b.height()/2), pos: 'right',  cursor: 'e-resize', disabled: 1};

      if((!self.properties.y.field && !self.properties.y.disabled)   || !self.properties.height.disabled)
        top.disabled = 0;

      if((!self.properties.y2.field && !self.properties.y2.disabled) || !self.properties.height.disabled)
        bottom.disabled = 0;      

      if((!self.properties.x.field && !self.properties.x.disabled)   || !self.properties.width.disabled)
        left.disabled = 0;

      if((!self.properties.x2.field && !self.properties.x2.disabled) || !self.properties.width.disabled)
        right.disabled = 0;

      return [top, bottom, left, right];      
    };    

    var mousemove = function() {
      var dragging = vde.iVis.dragging, evt = d3.event;
      if(!dragging) return;
      if(vde.iVis.activeMark != self) return;

      var props = self.properties,
          dx = Math.ceil(evt.pageX - dragging.prev[0]), 
          dy = Math.ceil(evt.pageY - dragging.prev[1]),
          data = dragging.item.datum.data;

      if(!data || data.disabled) return; 

      self.ngScope().$apply(function() {   
        switch(data.pos) {
          case 'top':
            var reverse = (props.y.scale && 
              props.y.scale.properties.range.name == 'height') ? -1 : 1;
            
              if(!props.y.disabled) props.y.value += dy*reverse;
              if(!props.height.disabled) props.height.value += dy*-1;

              self.update(['y', 'height']);
          break;

          case 'bottom':
            var reverse = (props.y2.scale && 
              props.y2.scale.properties.range.name == 'height') ? -1 : 1;

            if(!props.y2.disabled) props.y2.value += dy*reverse;
            if(!props.height.disabled) props.height.value += dy;

            self.update(['y2', 'height']);
          break;

          case 'left':
            if(!props.x.disabled) props.x.value += dx;
            if(!props.width.disabled) props.width.value += dx*-1;

            self.update(['x', 'width']);
          break;

          case 'right':
            if(!props.x2.disabled) props.x2.value += dx;
            if(!props.width.disabled) props.width.value += dx;

            self.update(['x2', 'width']);
          break;
        }
      });

      dragging.prev = [evt.pageX, evt.pageY];

      vde.iVis.view.data({ 'handle_data': positions() }).update();
    };

    return ['handle', positions(), {mousemove: mousemove}];
  };  

  prototype.helper = function(property) {
    var self = this, 
        item = vde.iVis.activeItem, 
        props = this.properties;
    if(!item.key) item = this.item(item);
    if(['x', 'x2', 'width', 'y', 'y2', 'height'].indexOf(property) == -1) return;

    var connectors = function(i) {
      var b  = vde.iVis.translatedBounds(i, i.bounds);
      switch(property) {
        case 'x': return [{x: b.x1, y: b.y1}, {x: b.x1, y: b.y2}]; break;
        case 'x2': return [{x: b.x2, y: b.y1}, {x: b.x2, y: b.y2}]; break;
        case 'width': return [{x: b.x1, y: b.y1}, {x: b.x2, y: b.y1}]; break;

        case 'y': return [{x: b.x1, y: b.y1}, {x: b.x2, y: b.y1}]; break;
        case 'y2': return [{x: b.x1, y: b.y2}, {x: b.x2, y: b.y2}]; break;
        case 'height': return [{x: b.x1, y: b.y1}, {x: b.x1, y: b.y2}]; break;
      };
    };

    var spans = function(i) {
      if(!i) return;
      var b  = vde.iVis.translatedBounds(i, i.bounds),
          gb = vde.iVis.translatedBounds(i.mark.group, i.mark.group.bounds),
          go = 10, io = 7; // offsets

      switch(property) {
        case 'x': 
          return [{x: (gb.x1-go), y: (b.y1-io), span: 0}, {x: b.x1, y: (b.y1-io), span: 0},
           {x: (gb.x1-go), y: (b.y2+io), span: 1}, {x: b.x1, y: (b.y2+io), span: 1}];
        break;

        case 'x2': 
          return [{x: (gb.x1-go), y: (b.y1-io), span: 0}, {x: b.x2, y: (b.y1-io), span: 0},
           {x: (gb.x1-go), y: (b.y2+io), span: 1}, {x: b.x2, y: (b.y2+io), span: 1}];
        break;

        case 'width': return [{x: b.x1, y: (b.y1-io), span: 0}, {x: b.x2, y: (b.y1-io), span: 0}]; break;

        case 'y': return (props.y.scale && props.y.scale.properties.range.name == 'height') ?
          [{x: (b.x1-io), y: (gb.y2+go), span: 0}, {x: (b.x1-io), y: b.y1, span: 0},
           {x: (b.x2+io), y: (gb.y2+go), span: 1}, {x: (b.x2+io), y: b.y1, span: 1}]
        :
          [{x: (b.x1-io), y: (gb.y1-go), span: 0}, {x: (b.x1-io), y: b.y1, span: 0},
           {x: (b.x2+io), y: (gb.y1-go), span: 1}, {x: (b.x2+io), y: b.y1, span: 1}];
        break;

        case 'y2': return (props.y2.scale && props.y2.scale.properties.range.name == 'height') ?
          [{x: (b.x1-io), y: (gb.y2+go), span: 0}, {x: (b.x1-io), y: b.y2, span: 0},
           {x: (b.x2+io), y: (gb.y2+go), span: 1}, {x: (b.x2+io), y: b.y2, span: 1}]
        :
          [{x: (b.x1-io), y: (gb.y1-go), span: 0}, {x: (b.x1-io), y: b.y2, span: 0},
           {x: (b.x2+io), y: (gb.y1-go), span: 1}, {x: (b.x2+io), y: b.y2, span: 1}];
        break;

        case 'height': return [{x: (b.x1-io), y: b.y1, span: 0}, {x: (b.x1-io), y: b.y2, span: 0}]; break;
      };
    }

    // var connectorData = this.items().reduce(function(acc, i) {
      // return acc.concat(connectors(i));
    // }, []);
    var connectorData = connectors(item);

    var spanData = spans(item);

    vde.iVis.interactor('connector', connectorData);
    vde.iVis.interactor('span', spanData);
    vde.iVis.parse();
  };

  return rect;
})();