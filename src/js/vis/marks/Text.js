vde.Vis.marks.Text = (function() {
  var text = function(name, groupName) {
    vde.Vis.Mark.call(this, name, groupName);

    this.type = 'text';

    this.properties = {
      x: {value: 0},
      y: {value: 0},

      text: {value: 'Hello World'},
      align: {value: 'left'},
      baseline: {value: 'bottom'},
      dx: {value: 0},
      dy: {value: 0},
      angle: {value: 0},
      font: {value: 'Helvetica'},
      fontSize: {value: 12},
      fontWeight: {value: 'normal'},
      fontStyle: {value: 'normal'},

      fill: {value: '#4682b4'},
    };

    return this.init();
  };

  text.prototype = new vde.Vis.Mark();
  var prototype  = text.prototype;

  prototype.productionRules = function(prop, scale, field) {
    switch(prop) {
      case 'text':
        scale = null;
      break;
    }

    return [scale, field];
  };

  prototype.checkExtents = function(prop) {
    var p = this.properties;

    if(p.align.value == 'center') p.dx.disabled = true;
    else delete p.dx.disabled;

    if(p.baseline.value == 'middle') p.dy.disabled = true;
    else delete p.dy.disabled;
  };

  prototype.interactive = function() {
    var self = this, 
        item = this.item(vde.iVis.activeItem), 
        props = this.properties;

    var positions = function() {
      var b = vde.iVis.translatedBounds(item, item.bounds),
        left  = {x: b.x1, y: b.y1 + (b.height()/2), pos: 'left',   cursor: 'w-resize', disabled: 0},
        right = {x: b.x2, y: b.y1 + (b.height()/2), pos: 'right',  cursor: 'e-resize', disabled: 0};

      return [left, right];
    }; 

    var mousemove = function() {
      var dragging = vde.iVis.dragging, evt = d3.event;
      if(!dragging) return;
      if(vde.iVis.activeMark != self) return;

      var handle = (dragging.item.mark.def.name == 'handle'),
          dx = Math.ceil(evt.pageX - dragging.prev[0]),
          dy = Math.ceil(evt.pageY - dragging.prev[1]),
          data = dragging.item.datum.data;

      self.ngScope().$apply(function() {
        if(handle) {
          if(data.pos == 'left') dx *= -1;
          props.fontSize.value = Math.round(props.fontSize.value + dx/5);
          if(props.fontSize.value < 1) props.fontSize.value = 1;
          self.update('fontSize');
        } else {
          if(!props.x.field) props.x.value += dx;
          if(!props.y.field) props.y.value += dy;
          self.update('x').update('y');
        }
      });

      dragging.prev = [evt.pageX, evt.pageY];
      vde.iVis.view.data({ 'handle_data': positions() }).update();
    };

    var keydown = function() {
      var e = d3.event;
      if(vde.iVis.activeMark != self) return;
      if(!e.metaKey) return;

      self.ngScope().$apply(function() {
        switch(e.keyCode) {
          case 66: // b
            props.fontWeight.value = (props.fontWeight.value == 'normal') ? 'bold' : 'normal';
          break;

          case 73: // i
            props.fontStyle.value = (props.fontStyle.value == 'normal') ? 'italic' : 'normal';
          break;
        }

        self.update('fontWeight').update('fontStyle');
      });      
    };

    return ['handle', positions(), {mousemove: mousemove, keydown: keydown}];
  };

  return text;
})();