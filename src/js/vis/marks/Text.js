vde.Vis.marks.Text = (function() {
  var text = function(name, groupName) {
    vde.Vis.Mark.call(this, name, groupName);

    this.type = 'text';

    this.properties = {
      x: {value: 0},
      y: {value: 0},

      text: {value: 'Text'},
      align: {value: 'center'},
      baseline: {value: 'middle'},
      dx: {value: 0},
      dy: {value: 0},
      angle: {value: 0},
      font: {value: 'Helvetica'},
      fontSize: {value: 12},
      fontWeight: {value: 'normal'},
      fontStyle: {value: 'normal'},

      fill: {value: '#4682b4'}
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

  prototype.selected = function() {
    var self = this, 
        item = vde.iVis.activeItem, 
        props = this.properties;
    if(!item.key) item = this.item(item);

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
          if(evt.metaKey && !props.angle.field) { // Rotate
            var b  = vde.iVis.translatedBounds(item, item.bounds),
                o  = $('#vis canvas').offset(),
                cx = b.x1 + b.width()/2,
                cy = b.y1 + b.height()/2;

            var rad = Math.atan2(evt.pageX - (o.left + cx), evt.pageY - (o.top + cy));
            var deg = (rad * (180 / Math.PI) * -1) + 90; 
            props.angle.value = Math.round(deg);
            self.update('angle');
          } else {
            if(data.pos == 'left') dx*=-1;
            props.fontSize.value = Math.round(props.fontSize.value + dx/5);
            if(props.fontSize.value < 1) props.fontSize.value = 1;
            self.update('fontSize');
          }
        } else {
          if(!props.x.field) props.x.value += dx;
          if(!props.y.field) props.y.value += dy;

          self.update(['x', 'y']);
        }
      });

      dragging.prev = [evt.pageX, evt.pageY];
      vde.iVis.show('handle');
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

        self.update(['fontWeight', 'fontStyle']);
      });      
    };

    vde.iVis.interactor('handle', this.handles(item), {mousemove: mousemove, keydown: keydown});
  };

  prototype.handles = function(item) {
    var props = this.properties,
        b = vde.iVis.translatedBounds(item, item.bounds),
        left = null, right = null;

    if(props.angle.value < 0 || (props.angle.value > 90 && props.angle.value < 180)) {
      left = {x: b.x1, y: b.y2}; right = {x: b.x2, y: b.y1}; 
    } else {
      left  = {x: b.x1, y: b.y1}; right = {x: b.x2, y: b.y2};
    } 

    left.pos = 'left'; left.cursor = 'nw-resize'; left.disabled = 0;
    right.pos = 'right'; right.cursor = 'se-resize'; right.disabled = 0;

    return [left, right];
  };

  return text;
})();