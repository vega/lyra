vde.Vis.marks.Line = (function() {
  var line = function(name, groupName) {
    vde.Vis.Mark.call(this, name, groupName);

    this.type = 'line';
    this.propType = 'points';

    this.properties = {
      x: {value: 0},
      x2: {value: 200},
      y: {value: 0},
      y2: {value: 200},

      interpolate: {value: 'monotone'},
      tension: {value: 0},

      stroke: {value: '#000000'},
      strokeWidth: {value: 2},
      strokeCap: {value: 'butt'}
    };

    vde.Vis.callback.register('vis.post_spec', this, this.dummyData);

    this.connectors = {'point': {}};

    return this;
  };

  line.prototype = new vde.Vis.Mark();
  var prototype  = line.prototype;
  var symbol = vde.Vis.marks.Symbol.prototype;

  prototype.destroy = function() {
    vde.Vis.callback.deregister('vis.post_spec',  this);
  };

  prototype.spec = function() {
    var propsForType = {
      points: ['x', 'y', 'interpolate', 'tension', 'stroke', 'strokeWidth', 'strokeOpacity', 'strokeCap'],
      path: ['path', 'fill', 'fillOpacity', 'stroke', 'strokeWidth', 'strokeCap'],
      rule: ['x', 'x2', 'y', 'y2', 'stroke', 'strokeWidth', 'strokeCap']
    };

    this.type = this.propType == 'points' ? 'line' : this.propType;

    for(var p in this.properties) {
      if(propsForType[this.propType].indexOf(p) == -1)
        delete this.properties[p];
    }

    this.dummySpec();

    return vde.Vis.Mark.prototype.spec.call(this);
  };

  prototype.defaults = function(prop) {
    var props = this.properties;
    if(['x', 'y'].indexOf(prop) == -1) return;
    var otherProp = (prop == 'x') ? 'y' : 'x';
    if(!props[otherProp].scale) {
      this.bindProperty(otherProp, {
          field: new vde.Vis.Field('index', '', 'linear', this.pipelineName),
          pipelineName: this.pipelineName
        }, true);

      props[otherProp].default = true;
    }
  };

  prototype.selected = function() {
    var self = this, item = this.item(vde.iVis.activeItem),
        props = this.properties;
    // var points = this.items().map(function(i) { return self.connectors['point'].coords(i, {disabled: 1}) });

    var mousemove = function() {
      var dragging = vde.iVis.dragging, evt = d3.event;
      if(!dragging || !dragging.prev) return;
      if(vde.iVis.activeMark != self) return;

      var dx = Math.ceil(evt.pageX - dragging.prev[0]),
          dy = Math.ceil(evt.pageY - dragging.prev[1]),
          data = dragging.item.datum.data;

      if(!data || data.disabled) return;

      vde.iVis.ngScope().$apply(function() {
        props.x.value += dx;
        props.y.value += dy;
        self.update(['x', 'y']);
      });
    }

    var enabled = (this.type == 'rule' && !props.x.field && !props.y.field)

    return {
      interactors: {
        handle: [this.connectors.point.coords(item, {disabled: !enabled})]
      },
      evtHandlers: {mousemove: mousemove}
    };
  };

  prototype.helper = function(property) {
    return symbol.helper.call(this, property);
  };

  prototype.propertyTargets = function() {
    return symbol.propertyTargets.call(this);
  };

  prototype.coordinates = function(connector, item, def) {
    if(!item) item = this.item(vde.iVis.activeItem);
    if(!item) return {x: 0, y: 0};  // If we've filtered everything out.

    var b = new vg.Bounds().set(item.x, item.y, item.x, item.y);
    b = vde.iVis.translatedBounds(item, b);

    var coord = {x: b.x1, y: b.y1, connector: connector, small: b.width() < 20 || b.height() < 20};
    for(var k in def) coord[k] = def[k];

    return coord;
  };

  prototype.spans = function(item, property) {
    return symbol.spans.call(this, item, property);
  };

  prototype.dummySpec = function() {
    if(this.type == 'line' && !this.properties.x.field && !this.properties.y.field) {
      this._spec.from = {data: 'vdeDummyData'};
      this._spec.properties.enter = {
        x: {field: 'data.x'},
        y: {field: 'data.y'},
        y2: {value: this.group().properties.height.value}
      };
    } else {
      this._spec.from = {};
      this._spec.properties.enter = {};
    }
  };

  prototype.dummyData = function(opts) {
    if(this.properties.x.field || this.properties.y.field) return;
    var g = this.group().properties;

    opts.spec.data.push({
      name: 'vdeDummyData',
      values: [{x: 25, y: (g.height.value / 2) + 50},
        {x: (g.width.value/2) + 50, y: 25}]
    });
  };

  return line;
})();
