vde.Vis.marks.Symbol = (function() {
  var symbol = function(name, groupName) {
    vde.Vis.Mark.call(this, name, groupName);

    this.type = 'symbol';

    this.properties = {
      x: {value: 0},
      y: {value: 0},

      size: {value: 100},
      shape: {value: 'diamond'},

      fill: {value: '#4682b4'},
      fillOpacity: {value: 1},
      stroke: {value: '#000000'},
      strokeWidth: {value: 0}
    };

    this.connectors = {'point': {}};

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
    };

    return [scale, field];
  };

  prototype.defaults = function(prop) {
    var props = this.properties;
    if(['x', 'y'].indexOf(prop) == -1) return;
    var otherProp = (prop == 'x') ? 'y' : 'x';
    if(!props[otherProp].scale) {
      this.bindProperty(otherProp, {
          field: new vde.Vis.Field('index', false, 'linear', this.pipelineName),
          pipelineName: this.pipelineName
        }, true);
    }
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

    vde.iVis.interactor('point', [this.connectors['point'].coords(item)]);
    vde.iVis.interactor('span', this.spans(item, property));
    vde.iVis.show(['point', 'span']);
  };

  prototype.target = function() {
    var self = this,
        item = this.item(vde.iVis.activeItem),
        spans = [], dropzones = [];

    ['x', 'y', 'size'].forEach(function(p) {
      var s = self.spans(item, p);
      if(p == 'size' && self.type != 'symbol') return;
      if(p == 'size') s = [s[2], s[3]];

      dropzones = dropzones.concat(self.dropzones(s));
      spans = spans.concat(s);
    });

    var mouseover = function(e, item) {
      if(!vde.iVis.dragging) return;
      if(item.mark.def.name != 'dropzone') return;

      vde.iVis.view.update({
        props: 'hover',
        items: item.cousin(-1).items[0].items
      });

      d3.select('#' + item.property + '.property').classed('drophover', true);
    };

    var mouseout = function(e, item) {
      if(!vde.iVis.dragging) return;
      if(item.mark.def.name != 'dropzone') return;

      // Clear highlights
      vde.iVis.view.update({
        props: 'update',
        items: item.cousin(-1).items[0].items
      });

      d3.select('#' + item.property + '.property').classed('drophover', false);
    };

    var mouseup = function(e, item) {
      if(!vde.iVis.dragging) return;
      if(item.mark.def.name != 'dropzone') return;

      if(item.property) vde.iVis.bindProperty(self, item.property, true);

      d3.select('#' + item.property + '.property').classed('drophover', false);
    };

    vde.iVis.interactor('point', [this.connectors['point'].coords(item)]);
    vde.iVis.interactor('span', spans);
    vde.iVis.interactor('dropzone', dropzones, {
      mouseover: mouseover,
      mouseout: mouseout,
      mouseup: mouseup
    });
    vde.iVis.show(['point', 'span', 'dropzone'])
  };

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
        pt = this.connectors['point'].coords(item, {disabled: 0});

    if(this.properties.size.field) pt.disabled = 1;

    return [pt];
  };

  prototype.spans = function(item, property) {
    var props = this.properties,
        b  = vde.iVis.translatedBounds(item, item.bounds),
        gb = vde.iVis.translatedBounds(item.mark.group, item.mark.group.bounds),
        go = 3*geomOffset, io = geomOffset,
        pt = this.connectors['point'].coords(item); // offsets

    switch(property) {
      case 'x':
        return [{x: (gb.x1-go), y: (pt.y+io), span: 'x_0'}, {x: pt.x, y: (pt.y+io), span: 'x_0'}];
      break;

      case 'y': return (props.y.scale && props.y.scale.range().name == 'height') ?
        [{x: (pt.x+io), y: (gb.y2+go), span: 'y_0'}, {x: (pt.x+io), y: (pt.y), span: 'y_0'}]
      :
        [{x: (pt.x+io), y: (gb.y1-go), span: 'y_0'}, {x: (pt.x+io), y: (pt.y), span: 'y_0'}]
      break;

      case 'size':
        return [{x: b.x1, y: b.y1-io, span: 'size_0'}, {x: b.x2, y: b.y1-io, span: 'size_0'},
        {x: b.x2+io, y: b.y1, span: 'size_1'}, {x: b.x2+io, y: b.y2, span: 'size_1'}];
      break;
    }
  };

  return symbol;
})();
