vde.Vis.marks.Symbol = (function() {
  var symbol = function(name, layerName, groupName) {
    vde.Vis.Mark.call(this, name, layerName, groupName);

    this.type = 'symbol';

    this.properties = {
      x: {value: 25},
      y: {value: 25},

      size: {value: 300},
      shape: {value: 'cross'},

      fill: {value: '#4682b4'},
      fillOpacity: {value: 1},
      stroke: {value: '#000000'},
      strokeWidth: {value: 0.25}
    };

    this.connectors = {'point': {}};

    return this;
  };

  symbol.prototype = new vde.Vis.Mark();
  var prototype  = symbol.prototype;
  var geomOffset = 7;

  prototype.productionRules = function(prop, scale, field) {
    if(scale) return [scale, field];

    if(prop == 'size') {
      scale = this.group().scale(this, {
        domainTypes: {from: 'field'},
        domainField: field,
        rangeTypes: {type: 'sizes'}
      }, {
        properties: {type: 'linear'},
        rangeTypes: {type: 'sizes', from: 'values'},
        rangeValues: [50, 1000]
      }, 'Size');
    } else if(prop == 'shape') {
      scale = this.group().scale(this, {
        domainTypes: {from: 'field'},
        domainField: field,
        rangeTypes: {type: 'shapes'}
      }, {
        properties: {type: 'ordinal'},
        rangeTypes: {type: 'shapes', from: 'preset'},
        rangeField: new vde.Vis.Field('shapes')
      }, 'Shape');
    }

    return [scale, field];
  };

  // prototype.defaults = function(prop) {
  //   var props = this.properties;
  //   if(['x', 'y'].indexOf(prop) == -1) return;
  //   var otherProp = (prop == 'x') ? 'y' : 'x';
  //   if(!props[otherProp].scale) {
  //     this.bindProperty(otherProp, {
  //         field: new vde.Vis.Field('index', '', 'linear', this.pipelineName),
  //         pipelineName: this.pipelineName
  //       }, true);
  //   }
  // };

  prototype.selected = function() {
    var self = this,
        item = this.item(vde.iVis.activeItem),
        props = this.properties;

    var mousemove = function() {
      var dragging = vde.iVis.dragging, evt = d3.event;
      if(!dragging || !dragging.prev) return;
      if(vde.iVis.activeMark != self) return;

      var handle = (dragging.item.mark.def.name == 'handle'),
          dx = Math.ceil(evt.pageX - dragging.prev[0]);
          //dy = Math.ceil(evt.pageY - dragging.prev[1]),
          //data = dragging.item.datum.data;

      if(!handle) return;

      self.iVisUpdated = true;

      vde.iVis.ngScope().$apply(function() {
        props.size.value += dx*10;
        self.update('size');
      });

      dragging.prev = [evt.pageX, evt.pageY];
      vde.iVis.show('selected');
    };

    var mouseup = function() {
      if(self.iVisUpdated)
        vde.iVis.ngScope().$apply(function() {
          vde.iVis.ngTimeline().save();
        });

      delete self.iVisUpdated;
    };

    vde.iVis.interactor('handle', this.handles(item));
    return {
      interactors: {handle: this.handles(item)},
      evtHandlers: {mousemove: mousemove, mouseup: mouseup}
    };
  };

  prototype.helper = function(property) {
    var item = this.item(vde.iVis.activeItem);
    if(['x', 'y', 'size'].indexOf(property) == -1) return;

    vde.iVis.interactor('point', [this.connectors['point'].coords(item)])
      .interactor('span', this.spans(item, property))
      .show(['point', 'span']);
  };

  prototype.propertyTargets = function(connector, showGroup) {
    var self = this,
        item = this.item(vde.iVis.activeItem),
        spans = [], dropzones = [];

    ['x', 'y', /* 'size' */].forEach(function(p) {
      var s = self.spans(item, p);
      if(p == 'size' && self.type != 'symbol') return;
      if(p == 'size') s = [s[2], s[3]];

      dropzones = dropzones.concat(self.dropzones(s));
      spans = spans.concat(s);
    });

    if(showGroup) {
      var groupInteractors = this.group().propertyTargets();
      if(groupInteractors.spans) spans = spans.concat(groupInteractors.spans);
      if(groupInteractors.dropzones) dropzones = dropzones.concat(groupInteractors.dropzones);
    }

    vde.iVis.interactor('point', [this.connectors['point'].coords(item)])
      .interactor('span', spans)
      .interactor('dropzone', dropzones)
      .show(['point', 'span', 'dropzone']);
  };

  prototype.connectionTargets = function() {
    var self  = this,
        item  = this.item(vde.iVis.activeItem);

    var connectors = vg.keys(this.connectors).map(function(c) { return self.connectors[c].coords(item); });
    var dropzones  = connectors.map(function(c) { return self.dropzones(c); });

    vde.iVis.interactor('connector', connectors)
      .interactor('dropzone', dropzones)
      .show(['connector', 'dropzone']);
  };

  prototype.connect = function(connector, mark) {
    var props = this.properties, mProps = mark.properties,
        ox = mProps.dx.offset, oy = mProps.dy.offset;

    mark.pipelineName = this.pipelineName;

    ['x', 'y'].forEach(function(p) {
      for(var k in props[p]) mProps[p][k] = props[p][k];
    });

    mProps.dx.offset = ox || 0;
    mProps.dy.offset = oy || 0;
  };

  prototype.coordinates = function(connector, item, def) {
    if(!item) item = this.item(vde.iVis.activeItem);
    if(!item) return {x: 0, y: 0};  // If we've filtered everything out.

    var b = vde.iVis.translatedBounds(item, item.bounds);

    var coord = {
      x: b.x1 + (b.width()/2),
      y: b.y1 + (b.height()/2),
      cursor: 'se-resize',
      connector: connector,
      small: b.width() < 20 || b.height() < 20
    };
    for(var k in def) coord[k] = def[k];

    return coord;
  };

  prototype.handles = function(item) {
    var pt = this.connectors['point'].coords(item, {disabled: 0});

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

      case 'y':
        return (props.y.scale && props.y.scale.range().name == 'height') ?
          [{x: (pt.x+io), y: (gb.y2+go), span: 'y_0'}, {x: (pt.x+io), y: (pt.y), span: 'y_0'}]
        :
          [{x: (pt.x+io), y: (gb.y1-go), span: 'y_0'}, {x: (pt.x+io), y: (pt.y), span: 'y_0'}];

      case 'size':
        return [{x: b.x1, y: b.y1-io, span: 'size_0'}, {x: b.x2, y: b.y1-io, span: 'size_0'},
        {x: b.x2+io, y: b.y1, span: 'size_1'}, {x: b.x2+io, y: b.y2, span: 'size_1'}];
    }
  };

  return symbol;
})();
