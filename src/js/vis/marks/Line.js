vde.Vis.marks.Line = (function() {
  var line = function(name, groupName) {
    vde.Vis.Mark.call(this, name, groupName);

    this.type = 'line';
    this.propType = 'points';

    this.properties = {
      x: {value: 0},
      y: {value: 0},

      interpolate: {value: 'monotone'},
      tension: {value: 0},

      stroke: {value: '#000000'},
      strokeWidth: {value: 2}
    };

    vde.Vis.callback.register('vis.post_spec', this, this.dummyData);

    this.connectors = {'point': {}};

    return this;
  };

  line.prototype = new vde.Vis.Mark();
  var prototype  = line.prototype;
  var symbol = vde.Vis.marks.Symbol.prototype;

  prototype.spec = function() {
    var propsForType = {
      points: ['x', 'y', 'interpolate', 'tension', 'stroke', 'strokeWidth'],
      path: ['path', 'fill', 'fillOpacity', 'stroke', 'strokeWidth']
    };

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
          field: new vde.Vis.Field('index', false, 'linear', this.pipelineName),
          pipelineName: this.pipelineName
        }, true);
    }
  };

  prototype.selected = function() {
    var self = this, item = this.item(vde.iVis.activeItem);
    // var points = this.items().map(function(i) { return self.connectors['point'].coords(i, {disabled: 1}) });

    return {interactors: {handle: [this.connectors.point.coords(item, {disabled: 1})]}};
  };

  prototype.helper = function(property) {
    return symbol.helper.call(this, property);
  };

  prototype.propertyTargets = function() {
    return symbol.propertyTargets.call(this);
  };

  prototype.coordinates = function(connector, item, def) {
    if(!item) item = this.item(vde.iVis.activeItem);
    var b = new vg.Bounds().set(item.x, item.y, item.x, item.y);
    b = vde.iVis.translatedBounds(item, b);

    var coord = {x: b.x1, y: b.y1, connector: connector};
    for(var k in def) coord[k] = def[k];

    return coord;
  };

  prototype.spans = function(item, property) {
    return symbol.spans.call(this, item, property);
  };

  prototype.dummySpec = function() {
    if(!this.properties.x.field && !this.properties.y.field) {
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
      values: [{x: 0, y: (g.height.value / 2) + 50},
        {x: (g.width.value/2) + 50, y: 0}]
    });
  };

  return line;
})();
