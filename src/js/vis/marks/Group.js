vde.Vis.marks.Group = (function() {
  var group = function(name, layerName, groupName) {
    vde.Vis.Mark.call(this, name || 'layer_' + vg.keys(vde.Vis.groups).length, layerName, groupName);

    this.displayName = 'Layer ' + vde.Vis.codename(vg.keys(vde.Vis.groups).length);
    this.type   = 'group';
    this.layer  = true;  // A psuedo-group exists in the spec, but not in the VDE UI.
    this.layerName = layerName || this.name;

    this.scales = {};
    this.axes   = {};
    this.marks  = {};
    this.markOrder = [];

    this._spec.scales   = [];
    this._spec.axes   = [];
    this._spec.marks  = [];

    this.fillType = 'color';
    this.properties = {
      x: {value: 0},
      width: {value: vde.Vis.properties.width},
      x2: {value: 0, disabled: true},
      y: {value: 0},
      height: {value: vde.Vis.properties.height},
      y2: {value: 0, disabled: true},
      clip: {value: false},

      fill: {value: '#ffffff'},
      fillOpacity: {value: 0},
      stroke: {value: '#000000'},
      strokeWidth: {value: 0}
    };

    this.connectors = {
      'top-left': {}, 'top-center': {}, 'top-right': {},
      'middle-left' : {}, 'middle-center': {}, 'middle-right': {},
      'bottom-left': {}, 'bottom-center': {}, 'bottom-right': {}
    };

    return this.init();
  };

  group.prototype = new vde.Vis.Mark();
  var prototype = group.prototype;

  prototype.init = function() {
    var self = this;
    if(this.isLayer()) {
      vde.Vis.groups[this.name] = this;
      vde.Vis.groupOrder.push(this.name);
    }

    return vde.Vis.Mark.prototype.init.call(this);
  };

  prototype.update = function(props) {
    vde.Vis.Mark.prototype.update.call(this, props);

    // Because a group could affect sub-marks, re-parse the submarks
    for(var m in this.marks)
      this.marks[m].update(['x', 'x2', 'width', 'y', 'y2', 'height']);

    return this;
  }

  prototype.spec = function() {
    var self = this;
    var spec = vg.duplicate(vde.Vis.Mark.prototype.spec.call(this));

    // We should be smarter than this.
    vg.keys(spec.properties.enter).forEach(function(k) {
      var p = spec.properties.enter[k];
      if(p.field) p.field = p.field.replace('stats.', '');
    });

    vde.Vis.callback.run('group.pre_spec', this, {spec: spec});

    ['scales', 'axes'].forEach(function(t) {
      vg.keys(self[t]).forEach(function(k) {
        var s = self[t][k].spec();
        if(!s) return;
        if(s.inheritFromGroup && !self.isLayer()) delete s.domain.data;
        spec[t].push(s);
      });
    });

    // Reverse order of marks: earlier in markOrder => closer to front
    this.markOrder.forEach(function(m) {
      var s = self.marks[m].spec();
      if(!s) return;
      spec.marks.unshift(s);
    });

    vde.Vis.callback.run('group.post_spec', this, {spec: spec});

    return spec;
  };

  prototype.bookkeep = function() {
    for(var s in this.scales)
      if(!this.scales[s].used) delete this.scales[s];
  };

  prototype.scale = function(mark, searchDef, defaultDef, displayName) {
    var scale = mark.pipeline().scale(searchDef, defaultDef, displayName);
    if(!this.isLayer()) this.group().scales[scale.name] = scale;
    this.scales[scale.name] = scale;

    return scale;
  };

  prototype.annotate = function() {
    this._def = null;
    this._items = [];
    this.def();

    for(var m in this.marks) {
      this.marks[m]._def = null;
      this.marks[m]._items = [];

      this.marks[m].def();
    }
  };

  prototype.export = function() {
    // Export w/o circular structure in marks
    if(!this._def && this._items.length == 0) return vg.duplicate(this);
    var marks = this.marks, def = this.def(), items = this.items();

    // We save it to _marks in case of nested groups, which need to stick
    // around in this.marks
    this._marks = {};
    for(var m in marks) {
      var ex = marks[m].export();
      this._marks[ex.name] = ex;
    }
    this._def = null;
    this._items = [];
    this.marks = this._marks;
    delete this._marks;

    var ex = vg.duplicate(this);
    this.marks = marks;
    this._def = def;
    this._items = items;

    return ex;
  };

  prototype.isLayer = function() {
    return this.layerName == this.name;
  };

  prototype.layout = function(layout) {
    var isHoriz = layout == vde.Vis.transforms.Facet.layout_horiz;
    var scale = this.group().scale(this, {
      domainTypes: {from: 'field'},
      domainField: new vde.Vis.Field('key', '', 'ordinal', this.pipeline().forkName),
      rangeTypes: {type: 'spatial', from: 'field'},
      rangeField: new vde.Vis.Field(isHoriz ? 'width' : 'height')
    }, {
      properties: {type: 'ordinal', padding: 0.2}
    }, 'groups');
    scale.properties.points = false;

    var keyField, bandField, disabledField;
    if(isHoriz) { keyField = 'x'; bandField = 'width'; disabledField = 'x2'; }
    else        { keyField = 'y'; bandField = 'height'; disabledField = 'y2'; }

    this.properties[keyField] = {
      scale: scale,
      field: new vde.Vis.Field('key', '', 'ordinal', this.pipeline().forkName)
    };

    this.properties[bandField] = { scale: scale, value: 'auto' };
    this.properties[disabledField].disabled = true;
  };

  prototype.selected = function() {
    // Since groups are fancy rects
    var selected = vde.Vis.marks.Rect.prototype.selected.call(this);

    // But we want to reparse the spec on mouseup (i.e. interactive resize)
    // to get the axes to do the right thing.
    selected.evtHandlers.mouseup = function() {
      vde.Vis.parse();

      vde.iVis.ngScope().$apply(function() {
        vde.iVis.ngTimeline().save();
      })
    };

    return selected;
  };

  prototype.coordinates = function(connector, item, def) {
    return vde.Vis.marks.Rect.prototype.coordinates.call(this, connector, item, def);
  };

  prototype.handles = function(item) {
    return vde.Vis.marks.Rect.prototype.handles.call(this, item);
  };

  prototype.spans = function(item, property) {
    return vde.Vis.marks.Rect.prototype.spans.call(this, item, property);
  };

  return group;
})();
